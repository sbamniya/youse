import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Image, Pressable } from "react-native";

import { AppScrollScreen } from "@/components/app/app-screen";
import { BrandMark } from "@/components/app/brand-mark";
import { PageIntro } from "@/components/app/page-intro";
import { PrimaryAction } from "@/components/app/primary-action";
import { Text } from "@/components/ui/text";
import { getImageUrl } from "@/lib/image-url";
import { currentUserQueryKey, getCurrentUser } from "@/lib/current-user";

const meeraPortrait = require("../../assets/images/memory-meera-avatar.png");

export default function UnlinkSuccess() {
  const { data: currentUser } = useQuery({
    queryKey: currentUserQueryKey,
    queryFn: getCurrentUser,
  });
  const name = currentUser?.name?.trim() || "You";
  const profilePicture = getImageUrl(currentUser?.profilePicture);

  return (
    <AppScrollScreen contentClassName="px-5 pb-11">
      <BrandMark className="mt-4 items-start" logoClassName="h-20 w-36" />
      <Image
        accessibilityLabel={`${name}'s profile picture`}
        className="mt-4 h-56 w-56 self-center overflow-hidden rounded-full"
        resizeMode="cover"
        source={profilePicture ? { uri: profilePicture } : meeraPortrait}
      />
      <PageIntro
        className="mt-4"
        description="Your shared space has been archived and is no longer available to either of you. Join a new space whenever you’re ready."
        displayTitle
        title={`${name}, your space\nis yours now.`}
      />
      <PrimaryAction
        className="mt-8"
        label="Enter an invite code"
        onPress={() => router.replace("/invite-code")}
      />
      <Pressable
        accessibilityRole="button"
        className="mt-5 items-center self-center px-3 py-2 active:opacity-65"
        onPress={() => router.replace({
          pathname: "/onboarding-details",
          params: { mode: "returning", userId: currentUser?.id ?? "" },
        })}
      >
        <Text className="font-serif text-[16px] text-primary">Create a new space instead</Text>
      </Pressable>
    </AppScrollScreen>
  );
}
