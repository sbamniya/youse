import { type Dayjs } from "dayjs";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
    Bell,
    CalendarDays,
    Camera,
    ChevronDown,
    Clock,
    Globe2,
    Heart,
    UserRound,
} from "lucide-react-native";
import { useState } from "react";
import {
    Alert,
    Image,
    Pressable,
    ScrollView,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCSSVariable } from "uniwind";

import { BackButton } from "@/components/app/back-button";
import { DatePicker } from "@/components/app/date-picker";
import { ImageSourcePicker } from "@/components/app/image-source-picker";
import { PrimaryAction } from "@/components/app/primary-action";
import { ThemedIcon } from "@/components/app/themed-icon";
import { TrialBadge } from "@/components/app/trial-badge";
import { Input, type InputProps } from "@/components/ui/input";
import { Text } from "@/components/ui/text";

const logo = require("../../assets/images/logo-full-white.png");
const meeraAvatar = require("../../assets/images/memory-meera-avatar.png");

export default function Profile() {
  const insets = useSafeAreaInsets();
  const background = useCSSVariable("--color-background") as string;
  const [name, setName] = useState("Meera Singh");
  const [profilePhotoUri, setProfilePhotoUri] = useState<string | null>(null);
  const [birthday, setBirthday] = useState<Dayjs | null>(null);
  const [timezone, setTimezone] = useState("Select timezone");
  const [notificationTime, setNotificationTime] = useState("Select time");
  const [relationshipLength, setRelationshipLength] = useState("Select length");
  const [anniversary, setAnniversary] = useState<Dayjs | null>(null);

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
      <ScrollView
        automaticallyAdjustKeyboardInsets
        className="flex-1"
        contentContainerClassName="pb-12"
        keyboardDismissMode="interactive"
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
                <BackButton />
                <Image source={logo} resizeMode="contain" className="h-6 w-16" />
              </View>
              <TrialBadge days={11} />
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
                  source={profilePhotoUri ? { uri: profilePhotoUri } : meeraAvatar}
                  resizeMode="cover"
                  className="h-28 w-28 rounded-full border-2 border-primary"
                />
                <ImageSourcePicker aspect={[1, 1]} onImageSelected={setProfilePhotoUri} title="Change profile photo">
                  {({ onPress }) => (
                    <Pressable
                      accessibilityLabel="Change profile photo"
                      className="absolute -bottom-1 -right-1 h-11 w-11 items-center justify-center rounded-full bg-primary active:opacity-80"
                      onPress={onPress}
                    >
                      <ThemedIcon
                        icon={Camera}
                        tone="primaryForeground"
                        size={20}
                        strokeWidth={1.8}
                      />
                    </Pressable>
                  )}
                </ImageSourcePicker>
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
            <ProfileDateField
              icon={CalendarDays}
              label="YOUR BIRTHDAY"
              onValueChange={setBirthday}
              placeholder="DD / MM / YYYY"
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
            <ProfileDateField
              icon={Clock}
              label="ANNIVERSARY DATE"
              onValueChange={setAnniversary}
              placeholder="DD / MM / YYYY"
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
    </View>
  );
}

type EditableFieldProps = InputProps & {
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
        <Input
          className="mt-2 p-0 font-serif text-[18px] text-foreground"
          variant="plain"
          {...inputProps}
        />
      </View>
    </View>
  );
}

type ProfileDateFieldProps = {
  icon: typeof UserRound;
  label: string;
  onValueChange: (date: Dayjs) => void;
  placeholder: string;
  value: Dayjs | null;
};

function ProfileDateField({ icon, label, onValueChange, placeholder, value }: ProfileDateFieldProps) {
  return (
    <DatePicker
      format="DD / MM / YYYY"
      onValueChange={onValueChange}
      placeholder={placeholder}
      title={label}
      value={value}
    >
      {({ displayValue, isPlaceholder, onPress }) => (
        <Pressable
          accessibilityLabel={`Choose ${label.toLowerCase()}`}
          className="min-h-24 flex-row items-center border-b border-primary/75 py-4 active:opacity-70"
          onPress={onPress}
        >
          <View className="w-14 items-center">
            <ThemedIcon icon={icon} size={27} strokeWidth={1.5} />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-[10px] font-medium tracking-[3px] text-primary">{label}</Text>
            <Text className={isPlaceholder ? "mt-2 font-serif text-[18px] text-muted-foreground" : "mt-2 font-serif text-[18px] text-foreground"}>
              {displayValue}
            </Text>
          </View>
        </Pressable>
      )}
    </DatePicker>
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
