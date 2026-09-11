import dayjs from "dayjs";
import { router } from "expo-router";
import { Pencil } from "lucide-react-native";
import { useState } from "react";
import { Image, Pressable, ScrollView, View } from "react-native";

import { AppScreen } from "@/components/app/app-screen";
import { BackButton } from "@/components/app/back-button";
import { DatePickerField } from "@/components/app/date-picker";
import { FormField } from "@/components/app/form-field";
import { PageIntro } from "@/components/app/page-intro";
import { PrimaryAction } from "@/components/app/primary-action";
import { ThemedIcon } from "@/components/app/themed-icon";
import { ToggleRow } from "@/components/app/toggle-row";
import { Text } from "@/components/ui/text";

const photo =
  "https://images.unsplash.com/photo-1726387871055-35c2c98357f9?q=80&w=987&auto=format&fit=crop";

export default function CreateMemory() {
  const [title, setTitle] = useState("Goa");
  const [date, setDate] = useState(() => dayjs("2026-02-03"));
  const [location, setLocation] = useState("South Goa");
  const [story, setStory] = useState(
    "No itinerary. We stayed on the beach until it got dark.",
  );
  const [shareWithPartner, setShareWithPartner] = useState(true);

  return (
    <AppScreen>
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="flex gap-1 flex-row items-center pt-2">
          <BackButton />
          <Text
            className="text-[12px] text-muted-foreground mb-0"
            style={{ letterSpacing: 5 }}
          >
            NEW MEMORY
          </Text>
        </View>

        <PageIntro
          displayTitle
          title="Keep this moment close."
        />

        <Pressable className="relative mt-6">
          <Image source={{ uri: photo }} resizeMode="cover" className="h-60 w-full rounded-3xl" />
          <View className="absolute bottom-3 right-3 flex-row items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5">
            <ThemedIcon icon={Pencil} size={14} strokeWidth={1.8} />
            <Text className="text-[13px] text-foreground">Change photo</Text>
          </View>
        </Pressable>

        <FormField
          label="Title"
          onChangeText={setTitle}
          placeholder="Goa"
          value={title}
        />
        <DatePickerField label="Date" onValueChange={setDate} value={date} />
        <FormField
          label="Location"
          onChangeText={setLocation}
          placeholder="South Goa"
          value={location}
        />
        <FormField
          label="Story"
          multiline
          onChangeText={setStory}
          placeholder="What made this moment special?"
          value={story}
        />

        <ToggleRow
          label="Share with Arjun"
          onValueChange={setShareWithPartner}
          value={shareWithPartner}
        />
      </ScrollView>

      <View className="px-4 pb-3 pt-2">
        <PrimaryAction label="Save memory" onPress={() => router.back()} />
      </View>
    </AppScreen>
  );
}
