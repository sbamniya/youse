import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { KeyRound } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, View } from "react-native";

import { AppHeader } from "@/components/app/app-header";
import { AppScreen } from "@/components/app/app-screen";
import { PageIntro } from "@/components/app/page-intro";
import { PrimaryAction } from "@/components/app/primary-action";
import { ThemedIcon } from "@/components/app/themed-icon";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import {
  INVITATION_CODE_LENGTH,
  invitationQueryKey,
  isCompleteInvitationCode,
  normalizeInvitationCode,
  verifyInvitationCode,
} from "@/lib/invite";

export default function InviteCode() {
  const queryClient = useQueryClient();
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");

  const normalizedCode = normalizeInvitationCode(inviteCode);
  const canVerifyInvitation = isCompleteInvitationCode(normalizedCode);

  const { isPending, mutate: verifyInvitation } = useMutation({
    mutationFn: verifyInvitationCode,
    onSuccess: (response, code) => {
      queryClient.setQueryData(invitationQueryKey(code), response);
      router.push({ pathname: "/invite-welcome", params: { code } });
    },
    onError: () => {
      setError("We couldn't find that invite. Check the code and try again.");
    },
  });

  const handleContinue = () => {
    if (!canVerifyInvitation || isPending) {
      return;
    }

    setError("");
    verifyInvitation(normalizedCode);
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
            maxLength={INVITATION_CODE_LENGTH}
            onChangeText={(value) => {
              setInviteCode(value);
              setError("");
            }}
            onSubmitEditing={handleContinue}
            placeholder="ABCD2345"
            returnKeyType="done"
            value={inviteCode}
          />
          {error ? (
            <Text className="mt-3 font-serif text-[15px] text-destructive">
              {error}
            </Text>
          ) : null}

          <PrimaryAction
            className="mt-7"
            disabled={!canVerifyInvitation || isPending}
            label={isPending ? "Verifying..." : "Continue"}
            onPress={handleContinue}
            showArrow
          />
        </View>
      </ScrollView>
    </AppScreen>
  );
}
