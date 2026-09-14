export type RazorpaySubscriptionCheckoutOptions = {
  contact?: string;
  description: string;
  key: string;
  name?: string;
  subscriptionId: string;
  themeColor: string;
};

export type RazorpaySubscriptionPayment = {
  razorpay_payment_id: string;
  razorpay_signature?: string;
  razorpay_subscription_id?: string;
};

export type RazorpayCheckoutError = {
  code?: number;
  description?: string;
  reason?: string;
};

export const isRazorpayCancellation = (error: unknown) => {
  if (!error || typeof error !== "object") {
    return false;
  }

  const checkoutError = error as RazorpayCheckoutError;
  return (
    checkoutError.code === 0 ||
    checkoutError.reason === "payment_cancelled" ||
    checkoutError.description?.toLowerCase().includes("cancel") === true
  );
};

export const openRazorpaySubscriptionCheckout = async (
  _options: RazorpaySubscriptionCheckoutOptions,
): Promise<RazorpaySubscriptionPayment> => {
  throw new Error("Razorpay Checkout is only available in the iOS and Android app.");
};
