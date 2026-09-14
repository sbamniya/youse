import { createHmac, timingSafeEqual } from "node:crypto";
import dayjs from "dayjs";
import Razorpay from "razorpay";

import { env } from "../../config/env";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/app-error";
import {
  refreshRelationshipCaches,
  spaceFor,
} from "../space/space.service";
import type {
  SubscriptionPlan,
  VerifyCheckoutInput,
} from "./subscription.schema";

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

const planConfig: Record<
  SubscriptionPlan,
  {
    amount: number;
    period: "monthly" | "yearly";
    planId: string;
    totalCount: number;
  }
> = {
  monthly: {
    amount: 149_00,
    period: "monthly",
    planId: env.RAZORPAY_MONTHLY_PLAN_ID,
    totalCount: 1_200,
  },
  yearly: {
    amount: 1299_00,
    period: "yearly",
    planId: env.RAZORPAY_YEARLY_PLAN_ID,
    totalCount: 100,
  },
};

type RazorpaySubscriptionEntity = {
  current_end?: number | null;
  id?: string;
  plan_id?: string;
  status?: string;
};

type RazorpayWebhookBody = {
  event?: string;
  payload?: {
    payment?: { entity?: { id?: string } };
    subscription?: { entity?: RazorpaySubscriptionEntity };
  };
};

const dateFromUnixSeconds = (value?: number | null) =>
  typeof value === "number" && Number.isFinite(value) && value > 0
    ? new Date(value * 1_000)
    : null;

const getPlanForRazorpayId = (planId?: string) =>
  (Object.entries(planConfig) as Array<
    [SubscriptionPlan, (typeof planConfig)[SubscriptionPlan]]
  >).find(([, config]) => config.planId === planId)?.[0];

const signaturesMatch = (received: string, expected: string) => {
  const receivedBuffer = Buffer.from(received, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");
  return (
    receivedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(receivedBuffer, expectedBuffer)
  );
};

export const getAccess = async (userId: string) => {
  const space = await spaceFor(userId);
  const subscription = space.subscription;
  const writable =
    !subscription ||
    dayjs(subscription.trialEndsAt).isAfter() ||
    dayjs(subscription.activeUntil).isAfter();
  return { writable, subscription };
};

export const createCheckout = async (
  userId: string,
  plan: SubscriptionPlan,
) => {
  const space = await spaceFor(userId);
  const existingSubscription = space.subscription;
  const trialEndsAt = dayjs(existingSubscription?.trialEndsAt);
  const startsAt =
    trialEndsAt.isValid() && trialEndsAt.isAfter(dayjs().add(10, "minutes"))
      ? trialEndsAt.toDate()
      : null;
  const payer = space.userId === userId ? space.user : space.partner;

  if (existingSubscription?.razorpaySubscriptionId) {
    const remoteSubscription = await razorpay.subscriptions.fetch(
      existingSubscription.razorpaySubscriptionId,
    );

    if (
      remoteSubscription.status === "created" &&
      existingSubscription.plan === plan
    ) {
      return {
        keyId: env.RAZORPAY_KEY_ID,
        plan,
        startsAt,
        subscriptionId: remoteSubscription.id,
        prefill: {
          contact: payer?.phone ?? undefined,
          name: payer?.name ?? undefined,
        },
      };
    }

    if (
      ["created", "authenticated", "active", "pending", "halted"].includes(
        remoteSubscription.status,
      )
    ) {
      const cachedActiveUntil = dayjs(existingSubscription.activeUntil);
      await prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          activeUntil:
            dateFromUnixSeconds(remoteSubscription.current_end) ??
            (cachedActiveUntil.isValid() ? cachedActiveUntil.toDate() : null),
          razorpayStatus: remoteSubscription.status,
        },
      });
      await refreshRelationshipCaches(space.userId, space.partnerId);
      throw new AppError(
        409,
        "This space already has a Razorpay subscription checkout",
      );
    }
  }

  const config = planConfig[plan];
  const configuredPlan = await razorpay.plans.fetch(config.planId);

  const planMatchesBillingScreen =
    Number(configuredPlan.item.amount) === config.amount &&
    configuredPlan.item.currency === "INR" &&
    configuredPlan.interval === 1 &&
    configuredPlan.period === config.period;
  if (!planMatchesBillingScreen) {
    throw new AppError(
      503,
      "The configured Razorpay plan does not match the advertised price",
    );
  }

  const remoteSubscription = await razorpay.subscriptions.create({
    plan_id: config.planId,
    total_count: config.totalCount,
    quantity: 1,
    customer_notify: true,
    ...(startsAt
      ? { start_at: Math.floor(startsAt.getTime() / 1_000) }
      : {}),
    notes: {
      plan,
      space_id: space.id,
    },
  });

  await prisma.subscription.upsert({
    where: { userPartnerId: space.id },
    update: {
      plan,
      razorpayPaymentId: null,
      razorpayStatus: remoteSubscription.status,
      razorpaySubscriptionId: remoteSubscription.id,
    },
    create: {
      plan,
      razorpayStatus: remoteSubscription.status,
      razorpaySubscriptionId: remoteSubscription.id,
      userPartnerId: space.id,
    },
  });

  await refreshRelationshipCaches(space.userId, space.partnerId);

  return {
    keyId: env.RAZORPAY_KEY_ID,
    plan,
    startsAt,
    subscriptionId: remoteSubscription.id,
    prefill: {
      contact: payer?.phone ?? undefined,
      name: payer?.name ?? undefined,
    },
  };
};

export const verifyCheckout = async (
  userId: string,
  input: VerifyCheckoutInput,
) => {
  const space = await spaceFor(userId);
  const localSubscription = await prisma.subscription.findUnique({
    where: { userPartnerId: space.id },
  });

  if (
    !localSubscription ||
    localSubscription.razorpaySubscriptionId !== input.razorpaySubscriptionId
  ) {
    throw new AppError(400, "Subscription does not belong to this space");
  }

  const expectedSignature = createHmac("sha256", env.RAZORPAY_KEY_SECRET)
    .update(`${input.razorpayPaymentId}|${input.razorpaySubscriptionId}`)
    .digest("hex");

  if (!signaturesMatch(input.razorpaySignature, expectedSignature)) {
    throw new AppError(400, "Invalid Razorpay payment signature");
  }

  const remoteSubscription = await razorpay.subscriptions.fetch(
    input.razorpaySubscriptionId,
  );
  const plan = getPlanForRazorpayId(remoteSubscription.plan_id);

  if (!plan || plan !== localSubscription.plan) {
    throw new AppError(400, "Razorpay plan does not match the selected plan");
  }

  const subscription = await prisma.subscription.update({
    where: { id: localSubscription.id },
    data: {
      activeUntil:
        dateFromUnixSeconds(remoteSubscription.current_end) ??
        localSubscription.activeUntil,
      razorpayPaymentId: input.razorpayPaymentId,
      razorpayStatus: remoteSubscription.status,
    },
  });

  await refreshRelationshipCaches(space.userId, space.partnerId);
  return subscription;
};

export const handleWebhook = async (
  rawBody: Buffer | undefined,
  signature: string | undefined,
  body: RazorpayWebhookBody,
) => {
  if (!rawBody || !signature) {
    throw new AppError(400, "Missing Razorpay webhook signature");
  }

  const validSignature = Razorpay.validateWebhookSignature(
    rawBody.toString("utf8"),
    signature,
    env.RAZORPAY_WEBHOOK_SECRET,
  );
  if (!validSignature) {
    throw new AppError(400, "Invalid Razorpay webhook signature");
  }

  if (!body.event?.startsWith("subscription.")) {
    return;
  }

  const entity = body.payload?.subscription?.entity;
  if (!entity?.id) {
    return;
  }

  const existing = await prisma.subscription.findUnique({
    where: { razorpaySubscriptionId: entity.id },
    include: { userPartner: true },
  });
  if (!existing) {
    return;
  }

  const activeUntil = dateFromUnixSeconds(entity.current_end);
  const plan = getPlanForRazorpayId(entity.plan_id);
  await prisma.subscription.update({
    where: { id: existing.id },
    data: {
      ...(activeUntil ? { activeUntil } : {}),
      ...(plan ? { plan } : {}),
      ...(body.payload?.payment?.entity?.id
        ? { razorpayPaymentId: body.payload.payment.entity.id }
        : {}),
      ...(entity.status ? { razorpayStatus: entity.status } : {}),
    },
  });

  await refreshRelationshipCaches(
    existing.userPartner.userId,
    existing.userPartner.partnerId,
  );
};
