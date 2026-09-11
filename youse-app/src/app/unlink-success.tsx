import { router } from "expo-router";
import { Image } from "react-native";

import { AppScrollScreen } from "@/components/app/app-screen";
import { BrandMark } from "@/components/app/brand-mark";
import { PageIntro } from "@/components/app/page-intro";
import { PrimaryAction } from "@/components/app/primary-action";

const meeraPortrait = require("../../assets/images/memory-meera-avatar.png");

export default function UnlinkSuccess() {
  return (
    <AppScrollScreen contentClassName="px-5 pb-11">
      <BrandMark className="mt-4 items-start" logoClassName="h-20 w-36" />
      <Image
        accessibilityLabel="Meera"
        className="mt-4 h-56 w-56 self-center overflow-hidden"
        resizeMode="cover"
        source={meeraPortrait}
      />
      <PageIntro
        className="mt-4"
        description="Your journal, moods and personal memories are still here. Invite someone new whenever you’re ready."
        displayTitle
        title={"Your space\nis yours now."}
      />
      <PrimaryAction
        className="mt-8"
        label="Invite someone new"
        onPress={() => router.replace("/invite-partner")}
      />
    </AppScrollScreen>
  );
}
