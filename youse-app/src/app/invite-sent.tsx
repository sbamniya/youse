import {
  ArrowRight,
  CalendarDays,
  ClipboardList,
  Image as ImageIcon,
  MessageCircle,
  Send,
} from "lucide-react-native";
import { Pressable, View } from "react-native";

import { AppScrollScreen } from "@/components/app/app-screen";
import { BrandMark } from "@/components/app/brand-mark";
import { PageIntro } from "@/components/app/page-intro";
import { ThemedIcon } from "@/components/app/themed-icon";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { DEMO_INVITE } from "@/lib/invite";

const setupItems = [
  { label: "Answer today’s question", icon: MessageCircle },
  { label: "Add your first shared plan", icon: CalendarDays },
  { label: "Add a memory", icon: ImageIcon },
  { label: "Start a date ideas list", icon: ClipboardList },
];

export default function InviteSent() {
  return (
    <AppScrollScreen>
      <BrandMark className="items-start" />
      <PageIntro
        className="mt-4"
        description={`Your invite code ${DEMO_INVITE.displayCode} is active\nand your 14-day trial has not started.`}
        displayTitle
        eyebrow="INVITE SENT"
        title={`Waiting for\n${DEMO_INVITE.inviteeName} to join`}
      />

      <View className="mt-8 flex-row gap-4">
        <Pressable className="h-12 flex-1 flex-row items-center justify-center rounded-full border border-accent">
          <ThemedIcon icon={Send} size={20} strokeWidth={1.8} />
          <Text className="ml-2 text-[14px] font-bold text-foreground">Send reminder</Text>
        </Pressable>
        <Pressable className="h-12 flex-1 flex-row items-center justify-center rounded-full border border-accent">
          <ThemedIcon icon={ClipboardList} size={20} strokeWidth={1.8} />
          <Text className="ml-2 text-[14px] font-bold text-foreground">Copy link</Text>
        </Pressable>
      </View>

      <Separator className="mt-7" />
      <Text className="mt-7 font-serif text-[24px] text-foreground">
        Set up your space while you wait
      </Text>

      <View className="mt-6">
        {setupItems.map(({ label, icon: Icon }) => (
          <Pressable key={label} className="mb-4 flex-row items-center">
            <View className="h-14 w-14 items-center justify-center rounded-full bg-secondary">
              <ThemedIcon icon={Icon} size={28} strokeWidth={1.8} />
            </View>
            <Text className="ml-5 flex-1 font-serif text-[18px] text-foreground">{label}</Text>
            <ThemedIcon icon={ArrowRight} size={28} strokeWidth={1.8} />
          </Pressable>
        ))}
      </View>
    </AppScrollScreen>
  );
}
