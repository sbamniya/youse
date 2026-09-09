import { router, useLocalSearchParams } from "expo-router";
import { Heart } from "lucide-react-native";
import { Image, View } from "react-native";

import { AppHeader } from "@/components/app/app-header";
import { AppScrollScreen } from "@/components/app/app-screen";
import { PageIntro } from "@/components/app/page-intro";
import { PrimaryAction } from "@/components/app/primary-action";
import { ThemedIcon } from "@/components/app/themed-icon";
import { Text } from "@/components/ui/text";
import { DEMO_INVITE } from "@/lib/invite";

const inviterImage =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=700&auto=format&fit=crop";

export default function InviteWelcome() {
  const { code } = useLocalSearchParams<{ code?: string }>();

  return (
    <AppScrollScreen>
      <AppHeader />

      <View className="items-center pt-10">
        <View className="relative">
          <Image
            source={{ uri: inviterImage }}
            resizeMode="cover"
            className="h-40 w-40 rounded-full border-2 border-primary"
          />
          <View className="absolute -bottom-2 right-1 h-12 w-12 items-center justify-center rounded-full bg-primary">
            <ThemedIcon icon={Heart} tone="primaryForeground" filled size={22} />
          </View>
        </View>

        <PageIntro
          align="center"
          className="mt-9"
          description="Meera invited you to join her shared space on Youse."
          displayTitle
          eyebrow="YOU'RE INVITED"
          title={`Welcome, ${DEMO_INVITE.inviteeName}`}
        />
        <View className="mt-7 rounded-2xl border border-muted px-6 py-4">
          <Text className="text-[11px] text-placeholder" style={{ letterSpacing: 3 }}>
            INVITE CODE
          </Text>
          <Text className="mt-2 text-center text-[18px] font-bold text-foreground">
            {code ?? DEMO_INVITE.code}
          </Text>
        </View>
      </View>

      <PrimaryAction
        className="mt-8"
        label="Confirm and continue"
        onPress={() =>
          router.push({ pathname: "/email-otp", params: { flow: "invite" } })
        }
        showArrow
      />
    </AppScrollScreen>
  );
}