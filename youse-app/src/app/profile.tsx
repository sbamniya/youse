import { useMutation, useQuery } from "@tanstack/react-query";
import dayjs, { type Dayjs } from "dayjs";
import type { ImagePickerAsset } from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { CalendarDays, Camera, UserRound } from "lucide-react-native";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    Pressable,
    ScrollView,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCSSVariable } from "uniwind";

import { AppScreen } from "@/components/app/app-screen";
import { BackButton } from "@/components/app/back-button";
import { DatePicker } from "@/components/app/date-picker";
import { ImageSourcePicker } from "@/components/app/image-source-picker";
import { PrimaryAction } from "@/components/app/primary-action";
import { ThemedIcon } from "@/components/app/themed-icon";
import { TrialBadge } from "@/components/app/trial-badge";
import { Input, type InputProps } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import api from "@/lib/api";
import { type AuthUser } from "@/lib/auth-user";
import {
  currentSpaceQueryOptions,
  getSubscriptionDaysRemaining,
  type CurrentSpace,
} from "@/lib/current-space";
import {
  currentUserQueryKey,
  getCurrentUser,
  usePersistCurrentUser,
} from "@/lib/current-user";
import { getImageUrl } from "@/lib/image-url";

const logo = require("../../assets/images/logo-full-white.png");
const meeraAvatar = require("../../assets/images/memory-meera-avatar.png");

export default function Profile() {
  const {
    data: user,
    isError: isUserError,
    isPending: isUserPending,
    refetch: refetchUser,
  } = useQuery({
    queryKey: currentUserQueryKey,
    queryFn: getCurrentUser,
  });
  const {
    data: space,
    isError: isSpaceError,
    isPending: isSpacePending,
    refetch: refetchSpace,
  } = useQuery(currentSpaceQueryOptions);

  if (isUserPending || isSpacePending) {
    return (
      <AppScreen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator colorClassName="accent-primary" size="large" />
        </View>
      </AppScreen>
    );
  }

  if (isUserError || isSpaceError || !user || !space) {
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
            onPress={() => {
              void refetchUser();
              void refetchSpace();
            }}
          />
        </View>
      </AppScreen>
    );
  }

  return <ProfileForm initialSpace={space} initialUser={user} />;
}

function ProfileForm({
  initialSpace,
  initialUser,
}: {
  initialSpace: CurrentSpace;
  initialUser: AuthUser;
}) {
  const insets = useSafeAreaInsets();
  const background = useCSSVariable("--color-background") as string;
  const persistCurrentUser = usePersistCurrentUser();
  const trialDaysRemaining = getSubscriptionDaysRemaining(initialSpace);
  // Timezone always tracks the device's current setting rather than being user-editable.
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const initialBirthday = initialUser.birthday
    ? dayjs(initialUser.birthday)
    : null;

  const [name, setName] = useState(initialUser.name ?? "");
  const [profilePhotoUri, setProfilePhotoUri] = useState(
    getImageUrl(initialUser.profilePicture),
  );
  const [birthday, setBirthday] = useState<Dayjs | null>(
    initialBirthday?.isValid() ? initialBirthday : null,
  );

  const { mutate: uploadProfilePicture } = useMutation({
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

        formData.append("profilePicture", {
          name: asset.fileName ?? `profile-picture.${extension ?? "jpg"}`,
          type: mimeType,
          uri: asset.uri,
        } as unknown as Blob);
      }

      return api.putForm<AuthUser>("/auth/me/profile-picture", formData);
    },
    onSuccess: async (updatedUser) => {
      setProfilePhotoUri(getImageUrl(updatedUser.profilePicture));
      await persistCurrentUser(updatedUser);
    },
    onError: () => {
      Alert.alert(
        "Upload failed",
        "The photo could not be uploaded. Please try again.",
      );
    },
  });

  const { isPending: isSavingProfile, mutate: saveChanges } = useMutation({
    mutationFn: () =>
      api.patch<AuthUser>("/auth/me", {
        name: name.trim(),
        timezone,
        birthday: birthday ? birthday.format("YYYY-MM-DD") : null,
      }),
    onSuccess: async (updatedUser) => {
      await persistCurrentUser(updatedUser);
      router.back();
    },
    onError: () => {
      Alert.alert(
        "Couldn't save changes",
        "Please check your connection and try again.",
      );
    },
  });

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
              {trialDaysRemaining !== null ? (
                <TrialBadge days={trialDaysRemaining} />
              ) : null}
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
                <ImageSourcePicker
                  aspect={[1, 1]}
                  onImageSelected={(uri, asset) => {
                    setProfilePhotoUri(uri);
                    uploadProfilePicture(asset);
                  }}
                  title="Change profile photo"
                >
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

            <PrimaryAction
              className="mt-8"
              disabled={isSavingProfile}
              label={isSavingProfile ? "Saving..." : "Save changes"}
              onPress={() => saveChanges()}
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
