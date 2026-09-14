import { useQueryClient } from "@tanstack/react-query";
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
import { Alert, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCSSVariable } from "uniwind";

import { PageIntro } from "@/components/app/page-intro";
import { PrimaryAction } from "@/components/app/primary-action";
import { ThemedIcon } from "@/components/app/themed-icon";
import { Text } from "@/components/ui/text";
import { currentSpaceQueryKey } from "@/lib/current-space";
import {
  isRazorpayCancellation,
  openRazorpaySubscriptionCheckout,
} from "@/lib/razorpay-checkout";
import {
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

export default function Billing() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const checkoutColor = useCSSVariable("--color-primary") as string;
  const [plan, setPlan] = useState<SubscriptionPlan>("yearly");
  const [checkoutState, setCheckoutState] = useState<
    "creating" | "idle" | "paying" | "verifying"
  >("idle");
  const [paymentError, setPaymentError] = useState("");
  const isYearly = plan === "yearly";
  const isProcessing = checkoutState !== "idle";

  const continueWithPlan = async () => {
    if (isProcessing) {
      return;
    }

    setPaymentError("");
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
          : "Your plan is confirmed and will begin when your trial ends.",
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
    checkoutState === "creating"
      ? "Preparing checkout..."
      : checkoutState === "paying"
        ? "Complete payment..."
        : checkoutState === "verifying"
          ? "Verifying payment..."
          : `Continue with ${isYearly ? "yearly" : "monthly"}`;

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
            eyebrow="YOUR 14-DAY TRIAL"
            description={`Keep your space going.\nYour shared history stays\nviewable, always.`}
            title="Welcome back"
            backArrow={{
              onPress: () =>
                router.canGoBack()
                  ? router.back()
                  : router.replace("/(tabs)/today"),
            }}
          />

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
              badge="Save 44%"
              caption="JUST ₹83/MONTH"
              isSelected={isYearly}
              onPress={() => {
                setPlan("yearly");
                setPaymentError("");
              }}
              price="₹999/year"
            />
            <PlanOption
              caption="BILLED MONTHLY"
              isSelected={!isYearly}
              onPress={() => {
                setPlan("monthly");
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
            disabled={isProcessing}
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
    </View>
  );
}

type PlanOptionProps = {
  badge?: string;
  caption: string;
  isSelected: boolean;
  onPress: () => void;
  price: string;
};

function PlanOption({
  badge,
  caption,
  isSelected,
  onPress,
  price,
}: PlanOptionProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected }}
      className={cn(
        "min-h-20 flex-row items-center rounded-[18px] border px-4 active:opacity-80",
        isSelected ? "border-primary bg-secondary/20" : "border-border-subtle",
      )}
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
