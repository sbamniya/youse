import type {
  RazorpaySubscriptionCheckoutOptions,
  RazorpaySubscriptionPayment,
} from "./razorpay-checkout";

export { isRazorpayCancellation } from "./razorpay-checkout";
export type {
  RazorpayCheckoutError,
  RazorpaySubscriptionCheckoutOptions,
  RazorpaySubscriptionPayment,
} from "./razorpay-checkout";

export const openRazorpaySubscriptionCheckout = async ({
  contact,
  description,
  key,
  name,
  subscriptionId,
  themeColor,
}: RazorpaySubscriptionCheckoutOptions): Promise<RazorpaySubscriptionPayment> => {
  const { default: RazorpayCheckout } = await import("react-native-razorpay");

  return RazorpayCheckout.open({
    key,
    subscription_id: subscriptionId,
    name: "Youse",
    description,
    prefill: {
      ...(contact ? { contact } : {}),
      ...(name ? { name } : {}),
    },
    recurring: true,
    theme: { color: themeColor },
  });
};
