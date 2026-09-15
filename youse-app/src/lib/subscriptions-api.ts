import api from "./api";

export type SubscriptionPlan = "monthly" | "yearly";

export type SubscriptionCheckout = {
  keyId: string;
  plan: SubscriptionPlan;
  prefill: {
    contact?: string;
    name?: string;
  };
  startsAt: string | null;
  subscriptionId: string;
};

export type VerifySubscriptionPaymentInput = {
  razorpayPaymentId: string;
  razorpaySignature: string;
  razorpaySubscriptionId: string;
};

export type ManagedSubscription = {
  activeUntil: string | null;
  cancelAtCycleEnd: boolean;
  id: string;
  pendingPlan: SubscriptionPlan | null;
  plan: SubscriptionPlan | null;
  razorpayPaymentId: string | null;
  razorpayStatus: string | null;
  razorpaySubscriptionId: string | null;
  trialEndsAt: string | null;
  userPartnerId: string;
};

export type VerifiedSubscription = ManagedSubscription & {
  plan: SubscriptionPlan;
  razorpayPaymentId: string;
  razorpayStatus: string;
  razorpaySubscriptionId: string;
};

export const createSubscriptionCheckout = (plan: SubscriptionPlan) =>
  api.post<SubscriptionCheckout, { plan: SubscriptionPlan }>(
    "/subscriptions/checkout",
    { plan },
  );

export const verifySubscriptionPayment = (
  input: VerifySubscriptionPaymentInput,
) =>
  api.post<VerifiedSubscription, VerifySubscriptionPaymentInput>(
    "/subscriptions/verify",
    input,
  );

export const changeSubscriptionPlan = (plan: SubscriptionPlan) =>
  api.patch<ManagedSubscription, { plan: SubscriptionPlan }>(
    "/subscriptions/plan",
    { plan },
  );

export const cancelSubscription = () =>
  api.post<ManagedSubscription, Record<string, never>>(
    "/subscriptions/cancel",
    {},
  );
