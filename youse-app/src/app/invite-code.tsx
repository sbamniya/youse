import { router } from "expo-router";
import { KeyRound } from "lucide-react-native";
import { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    View,
} from "react-native";

import { AppHeader } from "@/components/app/app-header";
import { AppScreen } from "@/components/app/app-screen";
import { PageIntro } from "@/components/app/page-intro";
import { PrimaryAction } from "@/components/app/primary-action";
import { ThemedIcon } from "@/components/app/themed-icon";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { DEMO_INVITE } from "@/lib/invite";

export default function InviteCode() {
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");

  const normalizedCode = inviteCode.replace(/[^a-z0-9]/gi, "").toUpperCase();

  const handleContinue = () => {
    if (normalizedCode !== DEMO_INVITE.code) {
      setError("We couldn't find that invite. Check the code and try again.");
      return;
    }

    router.push({ pathname: "/invite-welcome", params: { code: normalizedCode } });
  };

  return (
    <AppScreen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 px-3">
          <AppHeader />

          <View className="mt-14 px-2">
            <View className="h-16 w-16 self-center items-center justify-center rounded-full bg-secondary">
              <ThemedIcon icon={KeyRound} size={30} strokeWidth={1.7} />
            </View>
            <PageIntro
              align="center"
              className="mt-8"
              description="Use the private code your partner shared with you."
              displayTitle
              eyebrow="JOIN YOUR SPACE"
              title="Enter your invite code"
            />

            <Input
              autoCapitalize="characters"
              autoCorrect={false}
              className="mt-10 h-16 rounded-2xl border border-input px-5 text-center text-[23px] font-bold text-foreground"
              maxLength={8}
              onChangeText={(value) => {
                setInviteCode(value);
                setError("");
              }}
              placeholder={DEMO_INVITE.code}
              returnKeyType="done"
              value={inviteCode}
              onSubmitEditing={handleContinue}
            />
            {error ? (
              <Text className="mt-3 font-serif text-[15px] text-destructive">{error}</Text>
            ) : null}

            <PrimaryAction
              className="mt-7"
              disabled={!normalizedCode}
              label="Continue"
              onPress={handleContinue}
              showArrow
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}