import { useMutation, useQuery } from "@tanstack/react-query";
import dayjs, { type Dayjs } from "dayjs";
import type { ImagePickerAsset } from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { CalendarDays, Camera, Check, UserRound } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
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
import api from "@/lib/api";
import { authStorage } from "@/lib/auth-storage";
import { type AuthUser } from "@/lib/auth-user";
import { getImageUrl } from "@/lib/image-url";

const reasons = [
  { title: "Feel closer", subtitle: "DEEPEN YOUR CONNECTION" },
  { title: "Build better habits", subtitle: "CREATE HEALTHIER RHYTHMS" },
  { title: "Make more memories", subtitle: "PLAN A BRIGHTER TOMORROW" },
];

const genders = ["Woman", "Man", "Non-binary", "Prefer not to say"];

const relationshipTypes = [
  "Dating",
  "Committed relationship",
  "Engaged",
  "Married",
  "Domestic partnership",
  "Civil partnership",
  "Other",
];

type FormField =
  | "profilePicture"
  | "name"
  | "birthday"
  | "gender"
  | "reason"
  | "partnerName"
  | "relationshipType"
  | "anniversary"
  | "form";

type FormErrors = Partial<Record<FormField, string>>;

type SaveRelationshipPayload = {
  relationshipType: string;
  goal: string;
  partnerName: string;
  anniversary: string;
};

type SaveRelationshipResponse = {
  user: AuthUser;
  relationship: unknown;
  inviteCode: string;
};

export default function OnboardingDetails() {
  const { userId } = useLocalSearchParams<{
    userId?: string;
  }>();
  const {
    data: user,
    isError,
    isPending,
    refetch,
  } = useQuery({
    queryKey: ["auth", "onboarding-user", userId],
    queryFn: async () => {
      const storedUser = await authStorage.getUser();
      if (storedUser && (!userId || storedUser.id === userId)) {
        return storedUser;
      }

      const currentUser = await api.get<AuthUser>("/auth/me");
      await authStorage.setUser(currentUser);
      return currentUser;
    },
    retry: false,
  });

  if (isPending) {
    return (
      <AppScreen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator colorClassName="accent-primary" size="large" />
        </View>
      </AppScreen>
    );
  }

  if (isError || !user) {
    return (
      <AppScreen>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center font-serif text-[18px] text-muted-foreground">
            We couldn&apos;t load your profile. Check your connection and try
            again.
          </Text>
          <PrimaryAction
            className="mt-7 w-full"
            label="Try again"
            onPress={() => void refetch()}
          />
        </View>
      </AppScreen>
    );
  }

  return <OnboardingForm initialUser={user} />;
}

function OnboardingForm({ initialUser }: { initialUser: AuthUser }) {
  const initialBirthday = initialUser.birthday
    ? dayjs(initialUser.birthday)
    : null;
  const [name, setName] = useState(initialUser.name ?? "");
  const [profilePhotoUri, setProfilePhotoUri] = useState(
    getImageUrl(initialUser.profilePicture),
  );
  const [uploadedProfilePicture, setUploadedProfilePicture] = useState(
    initialUser.profilePicture,
  );
  const [birthday, setBirthday] = useState<Dayjs | null>(
    initialBirthday?.isValid() ? initialBirthday : null,
  );
  const [gender, setGender] = useState<string | null>(initialUser.gender);
  const [selectedReason, setSelectedReason] = useState<number | null>(null);
  const [partnerName, setPartnerName] = useState("");
  const [relationshipType, setRelationshipType] = useState<string | null>(null);
  const [anniversary, setAnniversary] = useState<Dayjs | null>(null);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<FormErrors>({});

  const clearError = (field: FormField) => {
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
  };

  const {
    isPending: isUploadingProfilePicture,
    mutate: uploadProfilePicture,
  } = useMutation({
    mutationFn: async (asset: ImagePickerAsset) => {
      const formData = new FormData();

      if (Platform.OS === "web" && asset.file) {
        formData.append("profilePicture", asset.file);
      } else {
        const extension = asset.fileName?.split(".").pop()?.toLowerCase();
        const mimeType =
          asset.mimeType ??
          (extension === "png"
            ? "image/png"
            : extension === "webp"
              ? "image/webp"
              : "image/jpeg");

        formData.append(
          "profilePicture",
          {
            name: asset.fileName ?? `profile-picture.${extension ?? "jpg"}`,
            type: mimeType,
            uri: asset.uri,
          } as unknown as Blob,
        );
      }

      return api.putForm<AuthUser>("/auth/me/profile-picture", formData);
    },
    onSuccess: async (updatedUser) => {
      setUploadedProfilePicture(updatedUser.profilePicture);
      clearError("profilePicture");
      await authStorage.setUser(updatedUser);
    },
    onError: () => {
      setUploadedProfilePicture(null);
      setErrors((current) => ({
        ...current,
        profilePicture: "The photo could not be uploaded. Please try again.",
      }));
    },
  });

  const { isPending: isSavingProfile, mutate: updateProfile } = useMutation({
    mutationFn: () =>
      api.patch<AuthUser>("/auth/me", {
        birthday: birthday!.format("YYYY-MM-DD"),
        gender,
        name: name.trim(),
      }),
    onSuccess: async (updatedUser) => {
      await authStorage.setUser(updatedUser);
      setStep(2);
    },
    onError: () => {
      setErrors((current) => ({
        ...current,
        form: "We couldn't save your details. Please try again.",
      }));
    },
  });

  const {
    isPending: isSavingRelationship,
    mutate: saveRelationship,
  } = useMutation({
    mutationFn: () =>
      api.put<SaveRelationshipResponse, SaveRelationshipPayload>("/space", {
        relationshipType: relationshipType!,
        goal: reasons[selectedReason!].title,
        partnerName: partnerName.trim(),
        anniversary: anniversary!.format("YYYY-MM-DD"),
      }),
    onSuccess: async ({ user: updatedUser }) => {
      await authStorage.setUser(updatedUser);
      router.replace("/invite-partner");
    },
    onError: () => {
      setErrors((current) => ({
        ...current,
        form: "We couldn't save your relationship details. Please try again.",
      }));
    },
  });

  const validateCurrentStep = () => {
    const nextErrors: FormErrors = {};

    if (step === 1) {
      if (!uploadedProfilePicture || isUploadingProfilePicture) {
        nextErrors.profilePicture = isUploadingProfilePicture
          ? "Please wait for your photo to finish uploading."
          : "Add a profile photo to continue.";
      }
      if (!name.trim()) {
        nextErrors.name = "Enter your name to continue.";
      }
      if (!birthday || !birthday.isValid() || birthday.isAfter(dayjs(), "day")) {
        nextErrors.birthday = "Choose a valid birthday.";
      }
      if (!gender) {
        nextErrors.gender = "Choose a gender option.";
      }
    }

    if (step === 2 && selectedReason === null) {
      nextErrors.reason = "Choose what brings you here.";
    }

    if (step === 3) {
      if (!partnerName.trim()) {
        nextErrors.partnerName = "Enter your partner's name.";
      }
      if (!relationshipType) {
        nextErrors.relationshipType = "Choose your relationship type.";
      }
      if (!anniversary || !anniversary.isValid()) {
        nextErrors.anniversary = "Choose your anniversary date.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validateCurrentStep()) {
      return;
    }

    if (step === 1) {
      updateProfile();
      return;
    }

    if (step === 2) {
      setStep((currentStep) => currentStep + 1);
      return;
    }

    saveRelationship();
  };

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
          <Text className="ml-4 text-[14px] text-accent">{step} / 3</Text>
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
                {profilePhotoUri ? (
                  <Image
                    source={{ uri: profilePhotoUri }}
                    resizeMode="cover"
                    className="h-24 w-24 rounded-full border border-input"
                  />
                ) : (
                  <View className="h-24 w-24 items-center justify-center rounded-full border border-input bg-muted">
                    <ThemedIcon icon={UserRound} tone="muted" size={38} />
                  </View>
                )}
                <ImageSourcePicker
                  aspect={[1, 1]}
                  onImageSelected={(uri, asset) => {
                    setProfilePhotoUri(uri);
                    setUploadedProfilePicture(null);
                    clearError("profilePicture");
                    uploadProfilePicture(asset);
                  }}
                  title="Add profile photo"
                >
                  {({ onPress }) => (
                    <Pressable
                      accessibilityLabel="Add profile photo"
                      className="absolute bottom-0 right-0 h-10 w-10 items-center justify-center rounded-full bg-primary disabled:opacity-60"
                      disabled={isUploadingProfilePicture}
                      onPress={onPress}
                    >
                      {isUploadingProfilePicture ? (
                        <ActivityIndicator
                          colorClassName="accent-primary-foreground"
                          size="small"
                        />
                      ) : (
                        <ThemedIcon
                          icon={Camera}
                          tone="primaryForeground"
                          size={20}
                          strokeWidth={2}
                        />
                      )}
                    </Pressable>
                  )}
                </ImageSourcePicker>
              </View>
              <View className="ml-6 flex-1">
                {name.trim() ? (
                  <Text className="font-serif text-[18px] text-foreground">
                    {name.trim()}
                  </Text>
                ) : null}
                <Text
                  className="mt-3 text-[10px] leading-5 text-muted-foreground"
                  style={{ letterSpacing: 3 }}
                >
                  ADD A PHOTO{"\n"}SO YOUR PARTNER{"\n"}CAN RECOGNIZE YOU
                </Text>
              </View>
            </View>
            <FieldError message={errors.profilePicture} />

            <Text
              className="mt-8 text-[12px] text-muted-foreground"
              style={{ letterSpacing: 4 }}
            >
              YOUR NAME
            </Text>
            <Input
              className="mt-2 text-[16px]"
              onChangeText={(value) => {
                setName(value);
                clearError("name");
              }}
              placeholder="Your name"
              value={name}
            />
            <FieldError message={errors.name} />

            <Text
              className="mt-4 text-[12px] text-muted-foreground"
              style={{ letterSpacing: 4 }}
            >
              BIRTHDAY
            </Text>
            <OnboardingDatePicker
              onValueChange={(value) => {
                setBirthday(value);
                clearError("birthday");
              }}
              placeholder="MM / DD / YYYY"
              title="Choose your birthday"
              value={birthday}
            />
            <FieldError message={errors.birthday} />

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
                    onPress={() => {
                      setGender(option);
                      clearError("gender");
                    }}
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
            <FieldError message={errors.gender} />
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
                    onPress={() => {
                      setSelectedReason(index);
                      clearError("reason");
                    }}
                  >
                    <View
                      className={`h-10 w-10 items-center justify-center rounded-full border-2 ${selected ? "border-accent" : "border-placeholder"}`}
                    >
                      {selected ? <ThemedIcon icon={Check} size={24} /> : null}
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
            <FieldError message={errors.reason} />
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
              maxLength={100}
              onChangeText={(value) => {
                setPartnerName(value);
                clearError("partnerName");
              }}
              placeholder="Their name"
              value={partnerName}
            />
            <FieldError message={errors.partnerName} />

            <Text
              className="mt-8 text-[12px] text-muted-foreground"
              style={{ letterSpacing: 4 }}
            >
              RELATIONSHIP TYPE
            </Text>
            <View className="mt-3 flex-row flex-wrap gap-3">
              {relationshipTypes.map((option) => {
                const selected = relationshipType === option;
                return (
                  <Pressable
                    key={option}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    className={`rounded-full border px-4 py-2 ${selected ? "border-accent bg-primary" : "border-placeholder"}`}
                    onPress={() => {
                      setRelationshipType(option);
                      clearError("relationshipType");
                    }}
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
            <FieldError message={errors.relationshipType} />

            <Text
              className="mt-8 text-[12px] text-muted-foreground"
              style={{ letterSpacing: 4 }}
            >
              ANNIVERSARY DATE
            </Text>
            <OnboardingDatePicker
              onValueChange={(value) => {
                setAnniversary(value);
                clearError("anniversary");
              }}
              placeholder="MM / DD / YYYY"
              title="Choose your anniversary date"
              value={anniversary}
            />
            <FieldError message={errors.anniversary} />
          </View>
        ) : null}

        <FieldError message={errors.form} />
        <PrimaryAction
          className="mt-8"
          disabled={
            isSavingProfile ||
            isSavingRelationship ||
            isUploadingProfilePicture
          }
          label={
            isSavingProfile || isSavingRelationship
              ? "Saving..."
              : step === 3
                ? "Finish"
                : "Continue"
          }
          onPress={handleContinue}
        />
      </ScrollView>
    </AppScreen>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? (
    <Text className="mt-2 font-serif text-[14px] text-destructive">
      {message}
    </Text>
  ) : null;
}

type OnboardingDatePickerProps = {
  onValueChange: (date: Dayjs) => void;
  placeholder: string;
  title: string;
  value: Dayjs | null;
};

function OnboardingDatePicker({
  onValueChange,
  placeholder,
  title,
  value,
}: OnboardingDatePickerProps) {
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
          <Text
            className={
              isPlaceholder
                ? "flex-1 text-[18px] text-muted-foreground"
                : "flex-1 text-[18px] text-foreground"
            }
          >
            {displayValue}
          </Text>
          <ThemedIcon icon={CalendarDays} size={20} strokeWidth={1.8} />
        </Pressable>
      )}
    </DatePicker>
  );
}
