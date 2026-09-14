import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Image } from "react-native";

import { AppScrollScreen } from "@/components/app/app-screen";
import { BrandMark } from "@/components/app/brand-mark";
import { PageIntro } from "@/components/app/page-intro";
import { PrimaryAction } from "@/components/app/primary-action";
import { getImageUrl } from "@/lib/image-url";
import { currentUserQueryKey, getCurrentUser } from "@/lib/current-user";

const meeraPortrait = require("../../assets/images/memory-meera-avatar.png");

export default function UnlinkSuccess() {
  const { mode } = useLocalSearchParams<{ mode?: "archive" | "delete" }>();
  const { data: currentUser } = useQuery({
    queryKey: currentUserQueryKey,
    queryFn: getCurrentUser,
  });
  const deleted = mode === "delete";
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
        description={deleted
          ? "Your shared photos, plans, lists, and memories have been deleted. Invite someone new whenever you’re ready."
          : "Your journal, moods and personal memories are still here. Invite someone new whenever you’re ready."}
        displayTitle
        title={`${name}, your space\nis yours now.`}
      />
      <PrimaryAction
        className="mt-8"
        label="Invite someone new"
        onPress={() => router.replace({
          pathname: "/onboarding-details",
          params: { mode: "returning", userId: currentUser?.id ?? "" },
        })}
      />
    </AppScrollScreen>
  );
}
