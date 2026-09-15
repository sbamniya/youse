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
  code?: number | string;
  description?: string;
  reason?: string;
};

type RazorpayWebCheckout = {
  on: (
    event: "payment.failed",
    handler: (response: { error?: RazorpayCheckoutError }) => void,
  ) => void;
  open: () => void;
};

type RazorpayWebCheckoutConstructor = new (options: {
  description: string;
  handler: (payment: RazorpaySubscriptionPayment) => void;
  key: string;
  modal: { ondismiss: () => void };
  name: string;
  prefill: { contact?: string; name?: string };
  recurring: boolean;
  subscription_id: string;
  theme: { color: string };
}) => RazorpayWebCheckout;

declare global {
  interface Window {
    Razorpay?: RazorpayWebCheckoutConstructor;
  }
}

const checkoutScriptId = "razorpay-checkout-script";
const checkoutScriptUrl = "https://checkout.razorpay.com/v1/checkout.js";
let checkoutScriptPromise: Promise<void> | null = null;

const loadCheckoutScript = async () => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("Razorpay Checkout requires a browser window.");
  }

  if (window.Razorpay) return;

  if (!checkoutScriptPromise) {
    checkoutScriptPromise = new Promise<void>((resolve, reject) => {
      document.getElementById(checkoutScriptId)?.remove();

      const script = document.createElement("script");
      script.async = true;
      script.id = checkoutScriptId;
      script.src = checkoutScriptUrl;
      script.onload = () => {
        if (window.Razorpay) {
          resolve();
        } else {
          reject(new Error("Razorpay Checkout did not initialize."));
        }
      };
      script.onerror = () => {
        reject(new Error("Razorpay Checkout could not be loaded."));
      };
      document.head.appendChild(script);
    }).catch((error) => {
      checkoutScriptPromise = null;
      throw error;
    });
  }

  await checkoutScriptPromise;
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
  {
    contact,
    description,
    key,
    name,
    subscriptionId,
    themeColor,
  }: RazorpaySubscriptionCheckoutOptions,
): Promise<RazorpaySubscriptionPayment> => {
  await loadCheckoutScript();

  const RazorpayCheckout = window.Razorpay;
  if (!RazorpayCheckout) {
    throw new Error("Razorpay Checkout is unavailable.");
  }

  return new Promise((resolve, reject) => {
    let settled = false;
    const resolveOnce = (payment: RazorpaySubscriptionPayment) => {
      if (settled) return;
      settled = true;
      resolve(payment);
    };
    const rejectOnce = (error: RazorpayCheckoutError | Error) => {
      if (settled) return;
      settled = true;
      reject(error);
    };

    try {
      const checkout = new RazorpayCheckout({
        key,
        subscription_id: subscriptionId,
        name: "Youse",
        description,
        handler: resolveOnce,
        prefill: {
          ...(contact ? { contact } : {}),
          ...(name ? { name } : {}),
        },
        recurring: true,
        modal: {
          ondismiss: () =>
            rejectOnce({
              code: 0,
              description: "Checkout was closed by the customer.",
              reason: "payment_cancelled",
            }),
        },
        theme: { color: themeColor },
      });

      checkout.on("payment.failed", ({ error }) => {
        rejectOnce(
          error ?? new Error("Razorpay could not complete the payment."),
        );
      });
      checkout.open();
    } catch (error) {
      rejectOnce(
        error instanceof Error
          ? error
          : new Error("Razorpay Checkout could not be opened."),
      );
    }
  });
};
