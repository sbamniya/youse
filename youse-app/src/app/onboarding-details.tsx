import { type Dayjs } from "dayjs";
import { router } from "expo-router";
import { CalendarDays, Camera, Check } from "lucide-react-native";
import { useState } from "react";
import {
    Image,
    Pressable,
    ScrollView,
    View,
} from "react-native";

import { AppScreen } from "@/components/app/app-screen";
import { DatePicker } from "@/components/app/date-picker";
import { ImageSourcePicker } from "@/components/app/image-source-picker";
import { PageIntro } from "@/components/app/page-intro";
import { PrimaryAction } from "@/components/app/primary-action";
import { ThemedIcon } from "@/components/app/themed-icon";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";

const profileImage =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=500&auto=format&fit=crop";

const reasons = [
  { title: "Feel closer", subtitle: "DEEPEN YOUR CONNECTION" },
  { title: "Build better habits", subtitle: "CREATE HEALTHIER RHYTHMS" },
  { title: "Make more memories", subtitle: "PLAN A BRIGHTER TOMORROW" },
];

const genders = ["Woman", "Man", "Non-binary", "Prefer not to say"];

export default function OnboardingDetails() {
  const [name, setName] = useState("Meera");
  const [profilePhotoUri, setProfilePhotoUri] = useState<string | null>(null);
  const [birthday, setBirthday] = useState<Dayjs | null>(null);
  const [gender, setGender] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState(0);
  const [partnerName, setPartnerName] = useState("");
  const [anniversary, setAnniversary] = useState<Dayjs | null>(null);
  const [step, setStep] = useState(1);

  return (
    <AppScreen>
      <ScrollView
        automaticallyAdjustKeyboardInsets
        contentContainerClassName="px-3 pb-3"
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
            <View className="flex-row items-center pt-2">
              <View className="flex-1 justify-center">
                <View className="h-1 bg-muted">
                  <View
                    className="h-1 bg-accent"
                    style={{ width: `${(step / 3) * 100}%` }}
                  />
                </View>
              </View>
              <Text className="ml-4 text-[14px] text-accent">
                {step} / 3
              </Text>
            </View>

            <PageIntro
              className="mt-8"
              description={
                step === 1
                  ? "A few details help us make\nyour experience more meaningful."
                  : step === 2
                    ? "Choose what you want to make\nmore meaningful together."
                    : "A few details help us celebrate\nyour relationship."
              }
              title={
                step === 1
                  ? "Tell us about you"
                  : step === 2
                    ? "What brings you here?"
                    : "Tell us about your partner"
              }
            />

            {step === 1 ? (
              <>
                <View className="mt-4 flex-row items-center">
                  <View className="relative">
                    <Image
                      source={{ uri: profilePhotoUri ?? profileImage }}
                      resizeMode="cover"
                      className="h-24 w-24 rounded-full border border-input"
                    />
                    <ImageSourcePicker aspect={[1, 1]} onImageSelected={setProfilePhotoUri} title="Add profile photo">
                      {({ onPress }) => (
                        <Pressable
                          accessibilityLabel="Add profile photo"
                          className="absolute bottom-0 right-0 h-10 w-10 items-center justify-center rounded-full bg-primary"
                          onPress={onPress}
                        >
                          <ThemedIcon icon={Camera} tone="primaryForeground" size={20} strokeWidth={2} />
                        </Pressable>
                      )}
                    </ImageSourcePicker>
                  </View>
                  <View className="ml-6 flex-1">
                    <Text className="font-serif text-[18px] text-foreground">
                      {name}
                    </Text>
                    <Text
                      className="mt-3 text-[10px] leading-5 text-muted-foreground"
                      style={{ letterSpacing: 3 }}
                    >
                      ADD A PHOTO{"\n"}SO YOUR PARTNER{"\n"}CAN RECOGNIZE YOU
                    </Text>
                  </View>
                </View>

                <Text
                  className="mt-8 text-[12px] text-muted-foreground"
                  style={{ letterSpacing: 4 }}
                >
                  YOUR NAME
                </Text>
                <Input
                  className="mt-2 text-[16px]"
                  onChangeText={setName}
                  placeholder="Your name"
                  value={name}
                />

                <Text
                  className="mt-4 text-[12px] text-muted-foreground"
                  style={{ letterSpacing: 4 }}
                >
                  BIRTHDAY
                </Text>
                <OnboardingDatePicker
                  onValueChange={setBirthday}
                  placeholder="MM / DD / YYYY"
                  title="Choose your birthday"
                  value={birthday}
                />

                <Text
                  className="mt-4 text-[12px] text-muted-foreground"
                  style={{ letterSpacing: 4 }}
                >
                  GENDER
                </Text>
                <View className="mt-2 flex-row flex-wrap gap-3">
                  {genders.map((option) => {
                    const selected = gender === option;
                    return (
                      <Pressable
                        key={option}
                        className={`rounded-full border px-4 py-2 ${selected ? "border-accent bg-primary" : "border-placeholder"}`}
                        onPress={() => setGender(option)}
                      >
                        <Text
                          className={`text-[12px] ${selected ? "font-bold text-primary-foreground" : "text-muted-foreground"}`}
                        >
                          {option}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            ) : null}

            {step === 2 ? (
              <View className="mt-12">
                <Text
                  className="text-[12px] text-muted-foreground"
                  style={{ letterSpacing: 4 }}
                >
                  WHAT BRINGS YOU HERE?
                </Text>
                <View className="mt-4">
                  {reasons.map((reason, index) => {
                    const selected = selectedReason === index;
                    return (
                      <Pressable
                        key={reason.title}
                        className="flex-row items-center border-b border-placeholder py-3"
                        onPress={() => setSelectedReason(index)}
                      >
                        <View
                          className={`h-10 w-10 items-center justify-center rounded-full border-2 ${selected ? "border-accent" : "border-placeholder"}`}
                        >
                          {selected ? (
                            <ThemedIcon icon={Check} size={24} />
                          ) : null}
                        </View>
                        <View className="ml-6 flex-1">
                          <Text className="font-serif text-[18px] text-foreground">
                            {reason.title}
                          </Text>
                          <Text
                            className="mt-1 text-[10px] text-muted-foreground"
                            style={{ letterSpacing: 3 }}
                          >
                            {reason.subtitle}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : null}

            {step === 3 ? (
              <View className="mt-12">
                <Text
                  className="text-[12px] text-muted-foreground"
                  style={{ letterSpacing: 4 }}
                >
                  PARTNER&apos;S NAME
                </Text>
                <Input
                  className="mt-2 text-[18px]"
                  onChangeText={setPartnerName}
                  placeholder="Their name"
                  value={partnerName}
                />

                <Text
                  className="mt-8 text-[12px] text-muted-foreground"
                  style={{ letterSpacing: 4 }}
                >
                  ANNIVERSARY DATE
                </Text>
                <OnboardingDatePicker
                  onValueChange={setAnniversary}
                  placeholder="MM / DD / YYYY"
                  title="Choose your anniversary date"
                  value={anniversary}
                />
              </View>
            ) : null}

            <PrimaryAction
              className="mt-8"
              label={step === 3 ? "Finish" : "Continue"}
              onPress={() => {
                if (step < 3) {
                  setStep((currentStep) => currentStep + 1);
                } else {
                  router.push("/invite-partner");
                }
              }}
            />
      </ScrollView>
    </AppScreen>
  );
}

type OnboardingDatePickerProps = {
  onValueChange: (date: Dayjs) => void;
  placeholder: string;
  title: string;
  value: Dayjs | null;
};

function OnboardingDatePicker({ onValueChange, placeholder, title, value }: OnboardingDatePickerProps) {
  return (
    <DatePicker
      format="MM / DD / YYYY"
      onValueChange={onValueChange}
      placeholder={placeholder}
      title={title}
      value={value}
    >
      {({ displayValue, isPlaceholder, onPress }) => (
        <Pressable
          accessibilityLabel={title}
          className="mt-2 h-12 flex-row items-center rounded-2xl border border-input pr-6 pl-4 active:opacity-70"
          onPress={onPress}
        >
          <Text className={isPlaceholder ? "flex-1 text-[18px] text-muted-foreground" : "flex-1 text-[18px] text-foreground"}>
            {displayValue}
          </Text>
          <ThemedIcon icon={CalendarDays} size={20} strokeWidth={1.8} />
        </Pressable>
      )}
    </DatePicker>
  );
}
