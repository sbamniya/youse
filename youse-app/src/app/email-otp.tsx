import { useMutation } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import type { TextInput as TextInputInstance } from "react-native";
import { Pressable, ScrollView, View } from "react-native";

import { AppScreen } from "@/components/app/app-screen";
import { BrandMark } from "@/components/app/brand-mark";
import { PageIntro } from "@/components/app/page-intro";
import { PrimaryAction } from "@/components/app/primary-action";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import api from "@/lib/api";
import { authStorage } from "@/lib/auth-storage";
import {
  type AuthenticationResponse,
  getUserDestination,
} from "@/lib/auth-user";
import {
  refreshCurrentUser,
  usePersistCurrentUser,
} from "@/lib/current-user";
import {
  acceptInvitationCode,
  normalizeInvitationCode,
} from "@/lib/invite";

const COUNTRY_CALLING_CODE = "+91";
const PHONE_NUMBER_LENGTH = 10;
const OTP_LENGTH = 6;
const RESEND_DELAY_SECONDS = 30;

const createEmptyOtp = () => Array<string>(OTP_LENGTH).fill("");

type OtpCredentials = {
  phone: string;
  code: string;
};

type EmailOtpFlow = "invite";

export default function EmailOtp() {
  const persistCurrentUser = usePersistCurrentUser();
  const { flow, invitationCode: invitationCodeParam } = useLocalSearchParams<{
    flow?: EmailOtpFlow;
    invitationCode?: string;
  }>();
  const invitationCode = normalizeInvitationCode(invitationCodeParam ?? "");
  const isInviteFlow = flow === "invite" && Boolean(invitationCode);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(createEmptyOtp);
  const [codeSent, setCodeSent] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(RESEND_DELAY_SECONDS);
  const [inputFocused, setInputFocused] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const otpInputs = useRef<(TextInputInstance | null)[]>([]);

  useEffect(() => {
    if (!codeSent || resendSeconds === 0) {
      return;
    }

    const timer = setTimeout(() => {
      setResendSeconds((seconds) => seconds - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [codeSent, resendSeconds]);

  const { mutate: sendCode, isPending: isSendingCode } = useMutation({
    mutationFn: async (phone: string) => {
      return api.post("/auth/otp/request", {
        phone: `${COUNTRY_CALLING_CODE}${phone}`,
      });
    },
    onSuccess: () => {
      setSubmitError("");
      setCodeSent(true);
      setResendSeconds(RESEND_DELAY_SECONDS);
      setInputFocused(false);
      setOtp(createEmptyOtp());
    },
    onError: () => {
      setCodeSent(false);
      setInputFocused(true);
      setSubmitError("We couldn't send a verification code. Please try again.");
    },
  });

  const {
    isError: shouldRetryAccept,
    isPending: isAcceptingInvitation,
    mutate: acceptInvitation,
    reset: resetAcceptInvitation,
  } = useMutation({
    // Invitation acceptance is authenticated. Keeping it separate from OTP
    // verification also lets a signed-in user retry without consuming a new OTP.
    mutationFn: async (code: string) => {
      await acceptInvitationCode(code);
      return refreshCurrentUser();
    },
    onSuccess: async (updatedUser) => {
      await persistCurrentUser(updatedUser);
      router.replace({
        pathname: "/onboarding-details",
        params: { flow: "accept", userId: updatedUser.id },
      });
    },
    onError: () => {
      setSubmitError(
        "You are signed in, but we couldn't accept the invitation. Please try again.",
      );
    },
  });

  const { mutate: verifyOtp, isPending: isVerifying } = useMutation({
    mutationFn: async (otpData: OtpCredentials) => {
      return api.post<AuthenticationResponse>("/auth/otp/verify", {
        phone: `${COUNTRY_CALLING_CODE}${otpData.phone}`,
        code: otpData.code,
      });
    },
    onSuccess: async (data) => {
      setSubmitError("");
      await Promise.all([
        authStorage.setAccessToken(data.accessToken),
        authStorage.setRefreshToken(data.refreshToken),
        persistCurrentUser(data.user),
      ]);

      if (isInviteFlow) {
        acceptInvitation(invitationCode);
        return;
      }

      router.replace(getUserDestination(data.user, "login"));
    },
    onError: () => {
      setSubmitError("The verification code is invalid or expired.");
    },
  });

  const handleSendCode = () => {
    setSubmitError("");
    sendCode(phoneNumber);
  };

  const handleChangePhoneNumber = () => {
    resetAcceptInvitation();
    setSubmitError("");
    setCodeSent(false);
    setOtp(createEmptyOtp());
    setResendSeconds(RESEND_DELAY_SECONDS);
    setInputFocused(false);
  };

  const formattedPhoneNumber =
    phoneNumber.length === PHONE_NUMBER_LENGTH
      ? `${phoneNumber.slice(0, 5)} ${phoneNumber.slice(5)}`
      : phoneNumber;

  const updateOtp = (value: string, index: number) => {
    const digits = value.replace(/\D/g, "");

    if (!digits) {
      const nextOtp = [...otp];
      nextOtp[index] = "";
      setOtp(nextOtp);

      if (index > 0) {
        setTimeout(() => otpInputs.current[index - 1]?.focus(), 0);
      }
      return;
    }

    if (digits.length > 1) {
      // SMS autofill and paste can send the entire code to a single input.
      // Spread those digits across the remaining boxes before moving focus.
      const nextOtp = [...otp];
      digits
        .slice(0, otp.length - index)
        .split("")
        .forEach((digit, digitIndex) => {
          nextOtp[index + digitIndex] = digit;
        });
      setOtp(nextOtp);
      otpInputs.current[
        Math.min(index + digits.length - 1, otp.length - 1)
      ]?.focus();
      return;
    }

    const nextValue = digits.slice(-1);
    const nextOtp = [...otp];
    nextOtp[index] = nextValue;
    setOtp(nextOtp);

    if (nextValue && index < otp.length - 1) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (key: string, index: number) => {
    if (key !== "Backspace" || otp[index] || index === 0) {
      return;
    }

    const previousIndex = index - 1;
    const nextOtp = [...otp];
    nextOtp[previousIndex] = "";
    setOtp(nextOtp);
    setTimeout(() => otpInputs.current[previousIndex]?.focus(), 0);
  };

  const handleVerify = () => {
    setSubmitError("");

    if (isInviteFlow && shouldRetryAccept) {
      acceptInvitation(invitationCode);
      return;
    }

    verifyOtp({ phone: phoneNumber, code: otp.join("") });
  };

  const isCompletingLogin = isVerifying || isAcceptingInvitation;

  return (
    <AppScreen>
      <ScrollView
        automaticallyAdjustKeyboardInsets
        contentContainerClassName="flex-grow px-3 pb-6"
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <BrandMark className="items-start pt-5" />

        <View className="mt-2">
          <Text
            className="text-[12px] leading-6 text-accent"
            style={{ letterSpacing: 6 }}
          >
            A BRIGHTER
          </Text>
          <Text
            className="text-[12px] leading-6 text-accent"
            style={{ letterSpacing: 6 }}
          >
            US, DAILY
          </Text>

          <PageIntro
            className="mt-4"
            description={`${codeSent ? "Enter the verification code" : "Enter your phone number"}\nto continue.`}
            title="Welcome back"
          />
        </View>

        {codeSent ? (
          <View className="mt-4">
            <Text className="font-serif text-[18px] text-muted-foreground">
              We sent a code to {COUNTRY_CALLING_CODE} {formattedPhoneNumber}
            </Text>
            <Pressable
              className="mt-2 self-start"
              onPress={handleChangePhoneNumber}
            >
              <Text className="font-serif text-[17px] text-accent underline">
                Change phone number
              </Text>
            </Pressable>
          </View>
        ) : null}

        {!codeSent ? (
          <>
            <View className="mt-8 flex-row items-center rounded-[20px] border border-input px-4 py-2">
              <Text className="text-[16px] font-bold text-foreground">
                {COUNTRY_CALLING_CODE}
              </Text>
              <View className="mx-3 h-9 w-px bg-input" />
              <Input
                autoComplete="tel"
                importantForAutofill="yes"
                keyboardType="phone-pad"
                maxLength={PHONE_NUMBER_LENGTH}
                onChangeText={(value) => {
                  setPhoneNumber(
                    value.replace(/\D/g, "").slice(0, PHONE_NUMBER_LENGTH),
                  );
                  setSubmitError("");
                }}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder="98765 43210"
                textContentType="telephoneNumber"
                className="flex-1 text-[16px] text-foreground"
                value={phoneNumber}
                variant="plain"
                readOnly={isSendingCode}
              />
            </View>

            <PrimaryAction
              className="mt-7"
              disabled={
                phoneNumber.length !== PHONE_NUMBER_LENGTH || isSendingCode
              }
              label={
                isSendingCode ? "Sending..." : "Send verification code"
              }
              onPress={handleSendCode}
              showArrow
            />
            {submitError ? (
              <Text className="mt-3 font-serif text-[15px] text-destructive">
                {submitError}
              </Text>
            ) : null}
          </>
        ) : null}

        {codeSent ? (
          <>
            <Text
              className="mt-8 text-[13px] text-accent"
              style={{ letterSpacing: 5 }}
            >
              ENTER VERIFICATION CODE
            </Text>
            <View className="mt-1 flex-row justify-between">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={(input) => {
                    otpInputs.current[index] = input;
                  }}
                  autoCapitalize="none"
                  autoComplete={index === 0 ? "sms-otp" : "off"}
                  keyboardType="number-pad"
                  maxLength={1}
                  onChangeText={(value) => updateOtp(value, index)}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  onKeyPress={({ nativeEvent }) =>
                    handleOtpKeyPress(nativeEvent.key, index)
                  }
                  selectionColorClassName="accent-primary"
                  textContentType={index === 0 ? "oneTimeCode" : "none"}
                  className="h-14 w-11 border-b border-foreground text-center text-[29px] text-foreground"
                  value={digit}
                  variant="plain"
                  readOnly={isCompletingLogin}
                />
              ))}
            </View>

            {resendSeconds > 0 ? (
              <Text className="mt-4 self-start font-serif text-[18px] text-muted-foreground">
                Resend code in 00:{String(resendSeconds).padStart(2, "0")}
              </Text>
            ) : (
              <Pressable
                className="mt-4 self-start"
                onPress={handleSendCode}
                disabled={isCompletingLogin}
              >
                <Text className="font-serif text-[18px] text-muted-foreground underline">
                  Resend code
                </Text>
              </Pressable>
            )}

            <PrimaryAction
              className="mt-5"
              disabled={
                (!shouldRetryAccept && otp.join("").length !== OTP_LENGTH) ||
                isCompletingLogin
              }
              label={
                isAcceptingInvitation
                  ? "Accepting invite..."
                  : isVerifying
                    ? "Verifying..."
                    : shouldRetryAccept
                      ? "Try accepting invite"
                      : "Verify"
              }
              onPress={handleVerify}
              showArrow
            />
            {submitError ? (
              <Text className="mt-3 font-serif text-[15px] text-destructive">
                {submitError}
              </Text>
            ) : null}
          </>
        ) : null}

        {!inputFocused ? (
          <View className="mt-auto pb-7">
            <View className="mb-5 h-px w-8 bg-muted-foreground" />
            <Text className="font-serif text-[22px] italic leading-8 text-muted-foreground">
              Same people{"\n"}brighter days.
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </AppScreen>
  );
}
