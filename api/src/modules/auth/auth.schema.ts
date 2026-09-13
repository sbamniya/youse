import { z } from 'zod';

const phoneSchema = z.string().trim().regex(/^\+[1-9]\d{7,14}$/, 'Use an E.164 phone number, for example +919876543210');
const timezoneSchema = z
  .string()
  .trim()
  .min(1)
  .max(100)
  .refine((timezone) => {
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: timezone }).format();
      return true;
    } catch {
      return false;
    }
  }, 'Use a valid IANA timezone, for example Asia/Kolkata');

export const requestOtpSchema = z.object({
  body: z.object({
    phone: phoneSchema,
  }),
  query: z.object({}),
  params: z.object({}),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    phone: phoneSchema,
    code: z.string().regex(/^\d{6}$/, 'OTP must contain six digits'),
    name: z.string().trim().min(1).max(100).optional(),
    timezone: timezoneSchema,
  }),
  query: z.object({}),
  params: z.object({}),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'refreshToken is required'),
  }),
  query: z.object({}),
  params: z.object({}),
});

export const updateProfileSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(1).max(100).nullable().optional(),
      timezone: timezoneSchema.nullable().optional(),
      gender: z.string().trim().min(1).max(50).nullable().optional(),
      birthday: z
        .union([z.string().date(), z.string().datetime({ offset: true })])
        .nullable()
        .optional(),
    })
    .refine((body) => Object.keys(body).length > 0, {
      message: 'Provide at least one supported profile field',
    }),
  query: z.object({}),
  params: z.object({}),
});

export type RequestOtpInput = z.infer<typeof requestOtpSchema>['body'];
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>['body'];
export type RefreshInput = z.infer<typeof refreshSchema>['body'];
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];
