import { router } from "expo-router";
import { Archive, Download, ShieldAlert, Trash2 } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PageIntro } from "@/components/app/page-intro";
import { PrimaryAction } from "@/components/app/primary-action";
import { SelectionOption } from "@/components/app/selection-option";
import { ThemedIcon } from "@/components/app/themed-icon";
import { Text } from "@/components/ui/text";

type DataOption = "export" | "archive" | "delete";

const options = [
  {
    comingSoon: true,
    description: "Download a copy of all shared photos, plans and memories to keep.",
    icon: Download,
    title: "Export everything",
    value: "export",
  },
  {
    comingSoon: true,
    description: "Keep everything, but move it out of your shared space. Only you can see it.",
    icon: Archive,
    title: "Archive privately",
    value: "archive",
  },
  {
    comingSoon: false,
    description: "Permanently delete all shared photos, plans and memories from both of our accounts.",
    icon: Trash2,
    title: "Delete shared data",
    value: "delete",
  },
] as const;

export default function UnlinkPartner() {
  const insets = useSafeAreaInsets();
  const [selection, setSelection] = useState<DataOption>("delete");

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-11"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingTop: Math.max(insets.top + 18, 42) }}>
          <PageIntro
            className="mt-2"
            eyebrow="RELATIONSHIP SETTINGS"
            description="Choose what happens to your photos, plans and memories."
            title={"What should happen\nto your shared\nspace?"}
            backArrow={{ onPress: () => router.back() }}
          />

          <View className="mt-6 gap-3">
            {options.map(({ comingSoon, description, icon, title, value }) => (
              <SelectionOption
                badge={comingSoon ? "Coming soon" : undefined}
                compact
                key={value}
                description={description}
                disabled={comingSoon}
                icon={icon}
                isSelected={selection === value}
                onPress={() => setSelection(value)}
                title={title}
              />
            ))}
          </View>

          <View className="mt-6 flex-row items-center rounded-[18px] border border-destructive/35 bg-destructive/10 px-4 py-4">
            <View className="h-10 w-10 shrink-0 items-center justify-center rounded-full border border-destructive/70">
              <ThemedIcon icon={ShieldAlert} tone="destructive" size={21} strokeWidth={1.7} />
            </View>
            <View className="ml-4 flex-1 border-l border-destructive/35 pl-4">
              <Text className="text-[16px] font-bold text-destructive">Unlinking is permanent.</Text>
              <Text className="mt-1 font-serif text-[14px] text-primary">Arjun will be notified.</Text>
            </View>
          </View>

          <PrimaryAction
            className="mt-6"
            label="Unlink Arjun"
            onPress={() => router.replace("/unlink-success")}
          />
          <Pressable
            accessibilityRole="button"
            className="mt-4 items-center self-center px-2 py-1 active:opacity-65"
            onPress={() => router.back()}
          >
            <Text className="font-serif text-[16px] text-primary">Cancel</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
