import { LinearGradient } from "expo-linear-gradient";
import {
    CalendarDays,
    Check,
    Image as ImageIcon,
    Pencil,
} from "lucide-react-native";
import { Alert, Image, ScrollView, View } from "react-native";
import { useCSSVariable } from "uniwind";

import { AppScreen } from "@/components/app/app-screen";
import { BrandMark } from "@/components/app/brand-mark";
import { PageIntro } from "@/components/app/page-intro";
import { PrimaryAction } from "@/components/app/primary-action";
import { ThemedIcon } from "@/components/app/themed-icon";
import { Text } from "@/components/ui/text";

const meeraImage =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=700&auto=format&fit=crop";
const arjunImage =
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=700&auto=format&fit=crop";

const readyItems = [
  { title: "Today’s question", subtitle: "Your answer is ready.", icon: Pencil },
  { title: "Your memory", subtitle: "Photo saved.", icon: ImageIcon },
  { title: "Plans", subtitle: "Calendar synced.", icon: CalendarDays },
];

export default function Connected() {
  const [card, background] = useCSSVariable([
    "--color-card",
    "--color-background",
  ]) as [string, string];

  return (
    <AppScreen>
      <LinearGradient
        colors={[card, background, card]}
        className="absolute inset-0"
      />
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-3 pb-3"
        showsVerticalScrollIndicator={false}
      >
        <BrandMark className="pt-2" showName showTagline />

        <View className="relative mt-6 flex-row items-center justify-center">
            <Image
              source={{ uri: meeraImage }}
              resizeMode="cover"
              className="aspect-square rounded-full border-2 border-primary"
              style={{ width: "30%" }}
            />
            <Image
              source={{ uri: arjunImage }}
              resizeMode="cover"
              className="aspect-square rounded-full border-2 border-primary"
              style={{ marginLeft: -20, width: "30%" }}
            />
            <View
              className="absolute bg-foreground"
              style={{
                borderRadius: 999,
                height: 44,
                left: "47%",
                top: "33%",
                width: 20,
              }}
            />
        </View>

        <PageIntro
          className="mt-6"
          description={"Your shared Space is live.\nYour 14-day full-access trial starts today, no card required."}
          title="You’re connected."
        />

        <View className="mt-6">
            {readyItems.map(({ title, subtitle, icon: Icon }, index) => (
              <View
                key={title}
                className={`flex-row items-center py-3 ${index ? "border-t border-muted" : ""}`}
              >
                <View className="h-12 w-12 items-center justify-center rounded-full bg-secondary">
                  <ThemedIcon icon={Icon} size={22} strokeWidth={1.8} />
                </View>
                <View className="ml-5 flex-1">
                  <Text className="text-[16px] font-semibold text-foreground">{title}</Text>
                  <Text className="mt-1 font-serif text-[14px] text-muted-foreground">{subtitle}</Text>
                </View>
                <View className="h-8 w-8 items-center justify-center rounded-full bg-primary">
                  <ThemedIcon icon={Check} tone="primaryForeground" size={20} strokeWidth={2.2} />
                </View>
              </View>
            ))}
        </View>
      </ScrollView>

      <View className="px-3 pt-2 pb-3">
        <PrimaryAction
          label="See your 14-day trial"
          onPress={() => Alert.alert("Your trial is active", "Your shared Space is ready.")}
          showArrow
        />
      </View>
    </AppScreen>
  );
}