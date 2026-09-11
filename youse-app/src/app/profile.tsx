import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  Bell,
  CalendarDays,
  Camera,
  ChevronDown,
  ChevronLeft,
  Clock,
  Globe2,
  Heart,
  UserRound,
} from "lucide-react-native";
import { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCSSVariable } from "uniwind";

import { PrimaryAction } from "@/components/app/primary-action";
import { ThemedIcon } from "@/components/app/themed-icon";
import { Text } from "@/components/ui/text";

const logo = require("../../assets/images/logo-full-white.png");
const meeraAvatar = require("../../assets/images/memory-meera-avatar.png");

export default function Profile() {
  const insets = useSafeAreaInsets();
  const [background, placeholder] = useCSSVariable([
    "--color-background",
    "--color-placeholder",
  ]) as [string, string];
  const [name, setName] = useState("Meera Singh");
  const [birthday, setBirthday] = useState("");
  const [timezone, setTimezone] = useState("Select timezone");
  const [notificationTime, setNotificationTime] = useState("Select time");
  const [relationshipLength, setRelationshipLength] = useState("Select length");
  const [anniversary, setAnniversary] = useState("");

  const choose = (
    title: string,
    values: string[],
    setValue: (value: string) => void,
  ) => {
    Alert.alert(title, undefined, [
      ...values.map((value) => ({ text: value, onPress: () => setValue(value) })),
      { style: "cancel", text: "Cancel" },
    ]);
  };

  return (
    <View className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="pb-12"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="relative h-60 overflow-hidden">
            <View className="absolute inset-0 bg-black/40" />
            <LinearGradient
              colors={["transparent", `${background}e6`, background]}
              locations={[0, 0.68, 1]}
              className="absolute inset-0"
            />

            <View
              className="absolute inset-x-0 top-0 flex-row items-center justify-between px-4"
              style={{ paddingTop: insets.top + 10 }}
            >
              <View className="flex-row items-center gap-3">
                <Pressable
                  accessibilityLabel="Go back"
                  className="h-9 w-9 items-center justify-center rounded-full border border-primary/35 bg-background/60 active:opacity-70"
                  onPress={() => router.back()}
                >
                  <ThemedIcon icon={ChevronLeft} size={20} strokeWidth={1.8} />
                </Pressable>
                <Image source={logo} resizeMode="contain" className="h-6 w-16" />
              </View>
              <View className="rounded-full border border-primary/35 bg-background/60 px-2.5 py-1.5">
                <Text className="text-[11px] font-medium text-accent">
                  11 days left
                </Text>
              </View>
            </View>

            <View className="absolute inset-x-0 bottom-0 px-4 pb-5">
              <Text className="text-[10px] font-medium tracking-[2px] text-muted-foreground">
                PROFILE SETTINGS
              </Text>
              <Text className="mt-2 text-[34px] font-bold leading-9 text-foreground">
                Make it yours
              </Text>
              <Text className="mt-1 font-serif text-[16px] text-primary">
                A more connected life starts with you.
              </Text>
            </View>
          </View>

          <View className="px-5">
            <View className="flex-row items-center py-6">
              <View className="relative">
                <Image
                  source={meeraAvatar}
                  resizeMode="cover"
                  className="h-28 w-28 rounded-full border-2 border-primary"
                />
                <Pressable
                  accessibilityLabel="Change profile photo"
                  className="absolute -bottom-1 -right-1 h-11 w-11 items-center justify-center rounded-full bg-primary active:opacity-80"
                  onPress={() => Alert.alert("Profile photo", "Choose a new profile photo.")}
                >
                  <ThemedIcon
                    icon={Camera}
                    tone="primaryForeground"
                    size={20}
                    strokeWidth={1.8}
                  />
                </Pressable>
              </View>
              <Text className="ml-8 flex-1 font-serif text-[18px] italic leading-7 text-primary">
                Same team.{"\n"}Always.
              </Text>
            </View>

            <EditableField
              icon={UserRound}
              label="YOUR NAME"
              onChangeText={setName}
              value={name}
            />
            <EditableField
              icon={CalendarDays}
              keyboardType="numbers-and-punctuation"
              label="YOUR BIRTHDAY"
              onChangeText={setBirthday}
              placeholder="DD / MM / YYYY"
              placeholderTextColor={placeholder}
              value={birthday}
            />
            <SelectField
              icon={Globe2}
              label="YOUR TIMEZONE"
              onPress={() =>
                choose(
                  "Select timezone",
                  ["Asia/Kolkata", "Europe/London", "America/New_York"],
                  setTimezone,
                )
              }
              value={timezone}
            />
            <SelectField
              icon={Bell}
              label="DAILY NOTIFICATION TIME"
              onPress={() =>
                choose(
                  "Select time",
                  ["8:00 AM", "12:00 PM", "6:00 PM", "8:00 PM"],
                  setNotificationTime,
                )
              }
              value={notificationTime}
            />

            <Text className="mt-10 text-[11px] font-medium tracking-[4px] text-primary">
              A LITTLE CONTEXT
            </Text>
            <SelectField
              icon={Heart}
              label="RELATIONSHIP LENGTH"
              onPress={() =>
                choose(
                  "Select relationship length",
                  ["Less than a year", "1–2 years", "3–5 years", "5+ years"],
                  setRelationshipLength,
                )
              }
              value={relationshipLength}
            />
            <EditableField
              icon={Clock}
              keyboardType="numbers-and-punctuation"
              label="ANNIVERSARY DATE"
              onChangeText={setAnniversary}
              placeholder="DD / MM / YYYY"
              placeholderTextColor={placeholder}
              value={anniversary}
            />

            <PrimaryAction
              className="mt-8"
              label="Save changes"
              onPress={() => {
                Alert.alert("Profile updated", "Your changes have been saved.");
                router.back();
              }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

type EditableFieldProps = React.ComponentProps<typeof TextInput> & {
  icon: typeof UserRound;
  label: string;
};

function EditableField({ icon, label, ...inputProps }: EditableFieldProps) {
  return (
    <View className="min-h-24 flex-row items-center border-b border-primary/75 py-4">
      <View className="w-14 items-center">
        <ThemedIcon icon={icon} size={27} strokeWidth={1.5} />
      </View>
      <View className="ml-3 flex-1">
        <Text className="text-[10px] font-medium tracking-[3px] text-primary">
          {label}
        </Text>
        <TextInput
          className="mt-2 p-0 font-serif text-[18px] text-foreground"
          cursorColorClassName="accent-primary"
          selectionColorClassName="accent-primary"
          {...inputProps}
        />
      </View>
    </View>
  );
}

type SelectFieldProps = {
  icon: typeof UserRound;
  label: string;
  onPress: () => void;
  value: string;
};

function SelectField({ icon, label, onPress, value }: SelectFieldProps) {
  return (
    <Pressable
      accessibilityRole="button"
      className="min-h-24 flex-row items-center border-b border-primary/75 py-4 active:opacity-70"
      onPress={onPress}
    >
      <View className="w-14 items-center">
        <ThemedIcon icon={icon} size={27} strokeWidth={1.5} />
      </View>
      <View className="ml-3 flex-1">
        <Text className="text-[10px] font-medium tracking-[3px] text-primary">
          {label}
        </Text>
        <Text className="mt-2 font-serif text-[18px] text-muted-foreground">
          {value}
        </Text>
      </View>
      <ThemedIcon icon={ChevronDown} size={22} strokeWidth={1.6} />
    </Pressable>
  );
}