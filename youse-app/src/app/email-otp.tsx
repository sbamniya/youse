import { router } from "expo-router";
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
import { useMutation } from "@tanstack/react-query";

export default function EmailOtp() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [codeSent, setCodeSent] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(30);
  const [inputFocused, setInputFocused] = useState(false);
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

  const { mutate: sendCode, isPending } = useMutation({
    mutationFn: async (phone: string) => {
      return api.post("/auth/otp/request", { phone: `+91${phone}` });
    },
    onSuccess: () => {
      setCodeSent(true);
      setResendSeconds(30);
      setInputFocused(false);
      setOtp(["", "", "", "", "", ""]);
    },
    onError: (err: any) => {
      console.log(
        "Failed to send code to phone number:",
        phoneNumber,
        "Error:",
        err,
      );
      setCodeSent(false);
      setInputFocused(true);
    },
  });

  const { mutate: verifyCode, isPending: isVerifying } = useMutation({
    mutationFn: async (otpData: { phone: string; code: string }) => {
      return api.post<AuthenticationResponse>("/auth/otp/verify", {
        phone: `+91${otpData.phone}`,
        code: otpData.code,
      });
    },
    onSuccess: async (data) => {
      await Promise.all([
        authStorage.setAccessToken(data.accessToken),
        authStorage.setRefreshToken(data.refreshToken),
        authStorage.setUser(data.user),
      ]);
      router.replace(getUserDestination(data.user, "login"));
    },
    onError: (err: any, variables: { phone: string; code: string }) => {
      console.log(
        "Failed to verify OTP for phone number:",
        variables.phone,
        "Error:",
        err,
      );
    },
  });

  const handleSendCode = () => {
    sendCode(phoneNumber);
  };

  const handleChangePhoneNumber = () => {
    setCodeSent(false);
    setOtp(["", "", "", "", "", ""]);
    setResendSeconds(30);
    setInputFocused(false);
  };

  const formattedPhoneNumber =
    phoneNumber.length === 10
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

  const onVerify = () => {
    verifyCode({ phone: phoneNumber, code: otp.join("") });
  };

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
              We sent a code to +91 {formattedPhoneNumber}
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
              <Text className="text-[16px] font-bold text-foreground">+91</Text>
              <View className="mx-3 h-9 w-px bg-input" />
              <Input
                autoComplete="tel"
                importantForAutofill="yes"
                keyboardType="phone-pad"
                maxLength={10}
                onChangeText={(value) =>
                  setPhoneNumber(value.replace(/\D/g, "").slice(0, 10))
                }
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder="98765 43210"
                textContentType="telephoneNumber"
                className="flex-1 text-[16px] text-foreground"
                value={phoneNumber}
                variant="plain"
                readOnly={isPending}
              />
            </View>

            <PrimaryAction
              className="mt-7"
              disabled={phoneNumber.length !== 10 || isPending}
              label={isPending ? "Sending..." : "Send verification code"}
              onPress={handleSendCode}
              showArrow
            />
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
                  readOnly={isVerifying}
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
                disabled={isVerifying}
              >
                <Text className="font-serif text-[18px] text-muted-foreground underline">
                  Resend code
                </Text>
              </Pressable>
            )}

            <PrimaryAction
              className="mt-5"
              disabled={otp.join("").length !== 6 || isVerifying}
              label="Verify"
              onPress={onVerify}
              showArrow
            />
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
