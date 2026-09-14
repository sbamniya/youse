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

export type VerifiedSubscription = {
  activeUntil: string | null;
  id: string;
  plan: SubscriptionPlan;
  razorpayPaymentId: string;
  razorpayStatus: string;
  razorpaySubscriptionId: string;
  trialEndsAt: string | null;
  userPartnerId: string;
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
