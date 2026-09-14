# Youse app 👋
Youse is a couple app.

## Build

```
eas build --platform android --profile preview --local
```

## Razorpay subscriptions

The billing screen uses the native `react-native-razorpay` SDK, so payment
checkout requires an Expo development or release build and does not run in
Expo Go.

The API requires Razorpay key ID, key secret, webhook secret, and monthly and
yearly plan IDs. The configured plans must use INR, an interval of 1, and match
the prices shown in the app:

- Monthly: ₹149 (`14900` paise), billed monthly.
- Yearly: ₹999 (`99900` paise), billed yearly.

Apply the Prisma migrations before deploying the API. In the Razorpay
Dashboard, point the subscription webhook to:

```text
https://YOUR_API_HOST/v1/subscriptions/webhook
```

Enable the subscription lifecycle events, especially `subscription.authenticated`,
`subscription.activated`, `subscription.charged`, `subscription.pending`,
`subscription.halted`, `subscription.cancelled`, and `subscription.completed`.
