declare module "react-native-razorpay" {
  type CheckoutOptions = {
    description?: string;
    key: string;
    name?: string;
    prefill?: {
      contact?: string;
      name?: string;
    };
    recurring?: boolean;
    subscription_id: string;
    theme?: { color?: string };
  };

  type CheckoutResult = {
    razorpay_payment_id: string;
    razorpay_signature?: string;
    razorpay_subscription_id?: string;
  };

  const RazorpayCheckout: {
    open(options: CheckoutOptions): Promise<CheckoutResult>;
  };

  export default RazorpayCheckout;
}
