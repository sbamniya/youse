import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import {
  Check,
  Clipboard as ClipboardIcon,
  LockKeyhole,
  Share2,
  Smartphone,
} from "lucide-react-native";
import { useState } from "react";
import { Pressable, Share, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useCSSVariable } from "uniwind";

import { AppScrollScreen } from "@/components/app/app-screen";
import { BrandMark } from "@/components/app/brand-mark";
import { PageIntro } from "@/components/app/page-intro";
import { PrimaryAction } from "@/components/app/primary-action";
import { ThemedIcon } from "@/components/app/themed-icon";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { DEMO_INVITE, DEMO_INVITE_URL } from "@/lib/invite";

export default function InvitePartner() {
  const [copied, setCopied] = useState(false);
  const [foreground, primaryForeground] = useCSSVariable([
    "--color-foreground",
    "--color-primary-foreground",
  ]) as [string, string];

  const copyCode = async () => {
    await Clipboard.setStringAsync(DEMO_INVITE.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const shareInvite = async () => {
    await Share.share({
      message: `Join my Youse space with invite code ${DEMO_INVITE.code}: ${DEMO_INVITE_URL}`,
    });
  };

  return (
    <AppScrollScreen>
      <BrandMark className="items-start" />
      <PageIntro
        className="mt-4"
        description={"Your space will become shared\nonly after he accepts your invite."}
        eyebrow="CONNECT YOUR SPACE"
        title={`Invite ${DEMO_INVITE.inviteeName}`}
      />

      <View className="mt-10 self-center rounded-2xl bg-foreground p-5">
        <QRCode
          value={DEMO_INVITE_URL}
          size={120}
          color={primaryForeground}
          backgroundColor={foreground}
        />
      </View>

      <Text className="mt-6 text-center text-[12px] text-muted-foreground" style={{ letterSpacing: 4 }}>
        INVITATION CODE
      </Text>
      <Text className="mt-2 text-center text-[24px] font-bold tracking-[6px] text-foreground">
        {DEMO_INVITE.displayCode}
      </Text>
      <Pressable className="mt-3 flex-row items-center justify-center" onPress={copyCode}>
        <ThemedIcon icon={copied ? Check : ClipboardIcon} size={18} />
        <Text className="ml-3 font-serif text-[16px] text-muted-foreground">
          {copied ? "Copied" : "Copy code"}
        </Text>
      </Pressable>

      <PrimaryAction className="mt-8" icon={Share2} label="Share invite" onPress={shareInvite} />

      <Pressable className="mt-8 flex-row items-center justify-center" onPress={shareInvite}>
        <ThemedIcon icon={Smartphone} size={28} strokeWidth={1.8} />
        <Text className="ml-3 text-[18px] font-semibold text-accent">Send by WhatsApp</Text>
      </Pressable>

      <PrimaryAction
        className="mt-8"
        label="Continue"
        onPress={() => router.push("/invite-sent")}
      />

      <Separator className="mt-10" />
      <View className="mt-7 flex-row items-start px-6">
        <ThemedIcon icon={LockKeyhole} tone="muted" size={22} strokeWidth={1.8} />
        <Text className="ml-5 flex-1 font-serif text-[17px] italic leading-6 text-muted-foreground">
          Your invite is private. Only people you share it with can join your space.
        </Text>
      </View>
    </AppScrollScreen>
  );
}