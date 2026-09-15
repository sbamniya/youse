import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { router } from "expo-router";
import {
  CalendarDays,
  CreditCard,
  Heart,
  Image as ImageIcon,
  UsersRound,
} from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCSSVariable } from "uniwind";

import { PageIntro } from "@/components/app/page-intro";
import { PrimaryAction } from "@/components/app/primary-action";
import { ThemedIcon } from "@/components/app/themed-icon";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Text } from "@/components/ui/text";
import {
  currentSpaceQueryKey,
  currentSpaceQueryOptions,
} from "@/lib/current-space";
import {
  isRazorpayCancellation,
  openRazorpaySubscriptionCheckout,
} from "@/lib/razorpay-checkout";
import {
  cancelSubscription,
  changeSubscriptionPlan,
  createSubscriptionCheckout,
  type SubscriptionPlan,
  verifySubscriptionPayment,
} from "@/lib/subscriptions-api";
import { cn } from "@/lib/utils";

const benefits = [
  {
    description: "Photos, notes and moments, in one place.",
    icon: ImageIcon,
    title: "All your memories",
  },
  {
    description: "Keep track of what’s next.",
    icon: CalendarDays,
    title: "Plan together",
  },
  {
    description: "Gentle insights for a closer you.",
    icon: Heart,
    title: "Understand each other",
  },
  {
    description: "Private, safe and ad-free.",
    icon: UsersRound,
    title: "A space that’s just yours",
  },
];

const paidSubscriptionStatuses = new Set([
  "active",
  "authenticated",
  "halted",
  "pending",
]);

const isSubscriptionPlan = (plan: string | null | undefined): plan is SubscriptionPlan =>
  plan === "monthly" || plan === "yearly";

const planLabel = (plan: SubscriptionPlan) =>
  plan === "yearly" ? "Yearly" : "Monthly";

const formatBillingDate = (date: string | null | undefined) => {
  if (!date) return null;
  const value = new Date(date);
  if (!Number.isFinite(value.getTime())) return null;

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(value);
};

const apiErrorMessage = (error: unknown, fallback: string) => {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || fallback;
  }
  return fallback;
};

export default function Billing() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const checkoutColor = useCSSVariable("--color-primary") as string;
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null,
  );
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [checkoutState, setCheckoutState] = useState<
    "creating" | "idle" | "paying" | "verifying"
  >("idle");
  const [paymentError, setPaymentError] = useState("");
  const {
    data: currentSpace,
    isError: isSpaceError,
    isPending: isSpacePending,
    refetch: refetchCurrentSpace,
  } = useQuery(currentSpaceQueryOptions);
  const subscription = currentSpace?.subscription;
  const currentPlan =
    isSubscriptionPlan(subscription?.plan) &&
    paidSubscriptionStatuses.has(subscription.razorpayStatus ?? "")
      ? subscription.plan
      : null;
  const pendingPlan = isSubscriptionPlan(subscription?.pendingPlan)
    ? subscription.pendingPlan
    : null;
  const plan = selectedPlan ?? pendingPlan ?? currentPlan ?? "yearly";
  const billingDate = formatBillingDate(subscription?.activeUntil);
  const isYearly = plan === "yearly";
  const changePlanMutation = useMutation({
    mutationFn: changeSubscriptionPlan,
    onSuccess: async (updatedSubscription, requestedPlan) => {
      await queryClient.invalidateQueries({ queryKey: currentSpaceQueryKey });
      setPaymentError("");
      const changeDate = formatBillingDate(updatedSubscription.activeUntil);
      Alert.alert(
        requestedPlan === currentPlan
          ? "Plan change removed"
          : "Plan change scheduled",
        requestedPlan === currentPlan
          ? `Your ${planLabel(currentPlan).toLowerCase()} plan will continue.`
          : `Your plan will change to ${planLabel(requestedPlan).toLowerCase()}${changeDate ? ` on ${changeDate}` : " at the end of this billing cycle"}.`,
      );
    },
    onError: (error) => {
      setPaymentError(
        apiErrorMessage(error, "We couldn’t change your plan. Please try again."),
      );
    },
  });
  const cancelSubscriptionMutation = useMutation({
    mutationFn: cancelSubscription,
    onSuccess: async (updatedSubscription) => {
      await queryClient.invalidateQueries({ queryKey: currentSpaceQueryKey });
      setIsCancelDialogOpen(false);
      setPaymentError("");
      const endDate = formatBillingDate(updatedSubscription.activeUntil);
      Alert.alert(
        "Cancellation scheduled",
        `Your plan will remain active${endDate ? ` until ${endDate}` : " until the end of this billing cycle"}.`,
      );
    },
    onError: (error) => {
      setIsCancelDialogOpen(false);
      setPaymentError(
        apiErrorMessage(error, "We couldn’t cancel your plan. Please try again."),
      );
    },
  });
  const isProcessing =
    checkoutState !== "idle" ||
    changePlanMutation.isPending ||
    cancelSubscriptionMutation.isPending;

  const continueWithPlan = async () => {
    if (isProcessing) {
      return;
    }

    setPaymentError("");

    if (currentPlan) {
      changePlanMutation.mutate(plan);
      return;
    }

    setCheckoutState("creating");
    let checkoutCompleted = false;

    try {
      const checkout = await createSubscriptionCheckout(plan);
      setCheckoutState("paying");
      const payment = await openRazorpaySubscriptionCheckout({
        contact: checkout.prefill.contact,
        description: isYearly ? "Youse yearly plan" : "Youse monthly plan",
        key: checkout.keyId,
        name: checkout.prefill.name,
        subscriptionId: checkout.subscriptionId,
        themeColor: checkoutColor,
      });
      checkoutCompleted = true;

      const razorpaySubscriptionId = payment.razorpay_subscription_id;
      const razorpaySignature = payment.razorpay_signature;
      if (!razorpaySubscriptionId || !razorpaySignature) {
        throw new Error("Razorpay did not return payment verification details.");
      }

      setCheckoutState("verifying");
      const subscription = await verifySubscriptionPayment({
        razorpayPaymentId: payment.razorpay_payment_id,
        razorpaySignature,
        razorpaySubscriptionId,
      });
      await queryClient.invalidateQueries({ queryKey: currentSpaceQueryKey });

      Alert.alert(
        "Subscription set up",
        subscription.razorpayStatus === "active"
          ? "Your Youse subscription is active for both partners."
          : "Your Youse subscription is confirmed for both partners.",
        [{ text: "Continue", onPress: () => router.replace("/(tabs)/today") }],
      );
    } catch (error) {
      if (isRazorpayCancellation(error)) {
        setPaymentError("Checkout was closed. You can try again when you’re ready.");
      } else if (isAxiosError(error) && error.response?.status === 409) {
        await queryClient.invalidateQueries({ queryKey: currentSpaceQueryKey });
        setPaymentError(
          "This space already has a Razorpay subscription. We refreshed its billing status.",
        );
      } else if (error instanceof Error && error.message.includes("only available")) {
        setPaymentError(error.message);
      } else {
        setPaymentError(
          checkoutCompleted
            ? "Razorpay completed checkout, but we couldn’t confirm it yet. Your access will update automatically; please check again shortly."
            : "We couldn’t complete the payment. Please try again.",
        );
      }
    } finally {
      setCheckoutState("idle");
    }
  };

  const actionLabel =
    changePlanMutation.isPending
      ? "Updating plan..."
      : checkoutState === "creating"
      ? "Preparing checkout..."
      : checkoutState === "paying"
        ? "Complete payment..."
        : checkoutState === "verifying"
          ? "Verifying payment..."
          : currentPlan
            ? pendingPlan === plan
              ? `Change to ${planLabel(plan).toLowerCase()} scheduled`
              : plan === currentPlan
                ? pendingPlan
                  ? `Keep ${planLabel(currentPlan).toLowerCase()} plan`
                  : "Current plan"
                : `Change to ${planLabel(plan).toLowerCase()}`
            : `Continue with ${isYearly ? "yearly" : "monthly"}`;
  const isPlanActionDisabled =
    isProcessing ||
    Boolean(
      currentPlan &&
        ((plan === currentPlan && !pendingPlan) || plan === pendingPlan),
    ) ||
    subscription?.cancelAtCycleEnd === true;

  if (isSpacePending) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator colorClassName="accent-primary" size="large" />
      </View>
    );
  }

  if (isSpaceError || !currentSpace) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text className="text-center font-serif text-[18px] text-muted-foreground">
          We couldn&apos;t load your billing details. Check your connection and
          try again.
        </Text>
        <PrimaryAction
          className="mt-7 w-full"
          label="Try again"
          onPress={() => void refetchCurrentSpace()}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-11"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingTop: Math.max(insets.top + 18, 42) }}>
          <PageIntro
            className="mt-2"
            eyebrow={currentPlan ? "BILLING" : "YOUR 14-DAY TRIAL"}
            description={
              currentPlan
                ? "Manage the plan that covers your shared space."
                : `Keep your space going.\nYour shared history stays\nviewable, always.`
            }
            title={currentPlan ? "Manage your plan" : "Welcome back"}
            backArrow={{
              onPress: () =>
                router.canGoBack()
                  ? router.back()
                  : router.replace("/(tabs)/today"),
            }}
          />

          {currentPlan ? (
            <View className="mt-5 rounded-[18px] border border-primary bg-secondary/20 p-5">
              <Text className="text-[10px] font-semibold tracking-[3px] text-primary">
                CURRENT PLAN
              </Text>
              <Text className="mt-2 text-[22px] font-bold text-foreground">
                {planLabel(currentPlan)} · {currentPlan === "yearly" ? "₹1,299/year" : "₹149/month"}
              </Text>
              <Text className="mt-2 font-serif text-[14px] leading-5 text-muted-foreground">
                {subscription?.cancelAtCycleEnd
                  ? `Cancellation scheduled${billingDate ? ` for ${billingDate}` : " for the end of this billing cycle"}.`
                  : pendingPlan
                    ? `Changes to ${planLabel(pendingPlan).toLowerCase()}${billingDate ? ` on ${billingDate}` : " at the end of this billing cycle"}.`
                    : billingDate
                      ? `Current billing period ends ${billingDate}.`
                      : "Active for both partners."}
              </Text>
              {!subscription?.cancelAtCycleEnd ? (
                <Pressable
                  accessibilityRole="button"
                  className="mt-4 w-full border-t border-border-subtle pt-4 active:opacity-65 disabled:opacity-50"
                  disabled={isProcessing}
                  onPress={() => {
                    setPaymentError("");
                    setIsCancelDialogOpen(true);
                  }}
                >
                  <Text className="font-serif text-[16px] text-destructive">
                    Cancel plan
                  </Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}

          <View className="mt-2">
            {benefits.map(({ description, icon, title }, index) => (
              <View
                key={title}
                className={`flex-row py-4 ${index ? "border-t border-border-subtle" : ""}`}
              >
                <View className="h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Text className="text-[16px] font-semibold text-foreground">
                    <ThemedIcon icon={icon} size={18} strokeWidth={1.5} />
                  </Text>
                </View>
                <View className="ml-5 flex-1 pt-1">
                  <Text className="text-[16px] font-semibold text-foreground">
                    {title}
                  </Text>
                  <Text className="mt-1 font-serif text-[14px] text-muted-foreground">
                    {description}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View className="mt-4 gap-3">
            <PlanOption
              badge={
                currentPlan === "yearly"
                  ? "Current plan"
                  : pendingPlan === "yearly"
                    ? "Scheduled"
                    : "Save 27%"
              }
              caption="JUST ₹108.25/MONTH"
              disabled={subscription?.cancelAtCycleEnd === true}
              isSelected={isYearly}
              onPress={() => {
                setSelectedPlan("yearly");
                setPaymentError("");
              }}
              price="₹1,299/year"
            />
            <PlanOption
              badge={
                currentPlan === "monthly"
                  ? "Current plan"
                  : pendingPlan === "monthly"
                    ? "Scheduled"
                    : undefined
              }
              caption="BILLED MONTHLY"
              disabled={subscription?.cancelAtCycleEnd === true}
              isSelected={!isYearly}
              onPress={() => {
                setSelectedPlan("monthly");
                setPaymentError("");
              }}
              price="₹149/month"
            />
          </View>

          <Text className="mt-4 text-center font-serif text-[14px] text-primary">
            One subscription covers both partners.
          </Text>

          <PrimaryAction
            accessibilityLabel={`Continue with ${isYearly ? "yearly" : "monthly"} plan`}
            className="mt-4"
            disabled={isPlanActionDisabled}
            label={actionLabel}
            onPress={() => void continueWithPlan()}
            icon={CreditCard}
            showArrow
          />

          {paymentError ? (
            <Text className="mt-3 text-center font-serif text-[14px] leading-5 text-destructive">
              {paymentError}
            </Text>
          ) : null}

          <Pressable
            accessibilityRole="button"
            className="mt-4 items-center self-center px-2 py-1 active:opacity-65 disabled:opacity-50"
            disabled={isProcessing}
            onPress={() => router.replace("/(tabs)/today")}
          >
            <Text className="font-serif text-[16px] text-primary">Not now</Text>
          </Pressable>
        </View>
      </ScrollView>

      <AlertDialog
        onOpenChange={setIsCancelDialogOpen}
        open={isCancelDialogOpen}
      >
        <AlertDialogContent className="mx-5 rounded-3xl border-border-subtle bg-card p-6 web:mx-0">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-left text-[22px] text-foreground">
              Cancel your {currentPlan ? planLabel(currentPlan).toLowerCase() : ""} plan?
            </AlertDialogTitle>
            <AlertDialogDescription className="mt-2 text-left text-[16px] leading-6 text-muted-foreground">
              Your subscription will stay active for both partners
              {billingDate ? ` until ${billingDate}` : " until the end of the current billing cycle"}.
              After that, you can still view your shared history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-2 gap-3">
            <AlertDialogCancel
              className="h-12 rounded-full"
              disabled={cancelSubscriptionMutation.isPending}
            >
              <Text>Keep plan</Text>
            </AlertDialogCancel>
            <AlertDialogAction
              className="h-12 rounded-full bg-destructive active:bg-destructive/90"
              disabled={cancelSubscriptionMutation.isPending}
              onPress={(event) => {
                event.preventDefault();
                cancelSubscriptionMutation.mutate();
              }}
            >
              <Text>
                {cancelSubscriptionMutation.isPending
                  ? "Cancelling…"
                  : "Cancel at period end"}
              </Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </View>
  );
}

type PlanOptionProps = {
  badge?: string;
  caption: string;
  disabled?: boolean;
  isSelected: boolean;
  onPress: () => void;
  price: string;
};

function PlanOption({
  badge,
  caption,
  disabled = false,
  isSelected,
  onPress,
  price,
}: PlanOptionProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected, disabled }}
      className={cn(
        "min-h-20 flex-row items-center rounded-[18px] border px-4 active:opacity-80",
        isSelected ? "border-primary bg-secondary/20" : "border-border-subtle",
      )}
      disabled={disabled}
      onPress={onPress}
    >
      <View
        className={cn(
          "h-6 w-6 items-center justify-center rounded-full border-2",
          isSelected ? "border-primary" : "border-primary/80",
        )}
      >
        {isSelected ? (
          <View className="h-2 w-2 rounded-full bg-primary" />
        ) : null}
      </View>
      <View className="ml-5 flex-1">
        <Text className="text-[20px] font-bold leading-7 text-foreground">
          {price}
        </Text>
        <Text className="mt-0.5 text-[8px] font-medium tracking-[3px] text-primary">
          {caption}
        </Text>
      </View>
      {badge ? (
        <View className="rounded-full bg-primary px-2 py-1.5">
          <Text className="text-[12px] font-semibold text-primary-foreground">
            {badge}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}
