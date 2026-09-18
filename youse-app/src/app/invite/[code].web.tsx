import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import {
  ArrowUpRight,
  Download,
  Heart,
  Smartphone,
  UserRound,
} from "lucide-react-native";
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BrandMark } from "@/components/app/brand-mark";
import { ThemedIcon } from "@/components/app/themed-icon";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import {
  APP_STORE_URL,
  PLAY_STORE_URL,
  getAppInviteUrl,
} from "@/lib/app-download";
import { getImageUrl } from "@/lib/image-url";
import {
  VERIFIED_INVITATION_STALE_TIME_MS,
  invitationQueryKey,
  isCompleteInvitationCode,
  normalizeInvitationCode,
  verifyInvitationCode,
} from "@/lib/invite";

const heroImage = require("../../../assets/images/memory-ladakh-hero.png");

export default function WebInviteLink() {
  const { code } = useLocalSearchParams<{ code?: string }>();
  const normalizedCode = normalizeInvitationCode(code ?? "");
  const hasCompleteCode = isCompleteInvitationCode(normalizedCode);
  const { data, isError, isPending, refetch } = useQuery({
    queryKey: invitationQueryKey(normalizedCode),
    queryFn: () => verifyInvitationCode(normalizedCode),
    enabled: hasCompleteCode,
    retry: false,
    staleTime: VERIFIED_INVITATION_STALE_TIME_MS,
  });

  if (!hasCompleteCode || isError) {
    return (
      <InvitePageFrame>
        <View className="flex-1 items-center justify-center py-16">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <ThemedIcon icon={Heart} size={28} strokeWidth={1.8} />
          </View>
          <Text className="mt-7 text-center font-serif text-[30px] leading-9">
            This invite couldn&apos;t be found
          </Text>
          <Text className="mt-3 max-w-[320px] text-center text-[15px] leading-6 text-muted-foreground">
            The link may be incomplete or no longer active. Ask your partner to
            share a fresh invitation.
          </Text>
          {hasCompleteCode ? (
            <Button
              className="mt-7 h-12 rounded-full px-7"
              onPress={() => void refetch()}
            >
              <Text className="font-bold text-primary-foreground">Try again</Text>
            </Button>
          ) : null}
        </View>
      </InvitePageFrame>
    );
  }

  if (isPending || !data) {
    return (
      <InvitePageFrame>
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator colorClassName="accent-primary" size="large" />
          <Text className="mt-4 text-muted-foreground">Opening your invite…</Text>
        </View>
      </InvitePageFrame>
    );
  }

  const { invitation } = data;
  const inviterName = invitation.inviter.name?.trim() || "Your partner";
  const inviterImage = getImageUrl(invitation.inviter.profilePicture);
  const appInviteUrl = getAppInviteUrl(normalizedCode);

  return (
    <InvitePageFrame>
      <View className="items-center pt-5">
        <View className="relative">
          {inviterImage ? (
            <Image
              source={{ uri: inviterImage }}
              resizeMode="cover"
              className="h-28 w-28 rounded-full border-2 border-primary"
            />
          ) : (
            <View className="h-28 w-28 items-center justify-center rounded-full border-2 border-primary bg-muted">
              <ThemedIcon icon={UserRound} tone="muted" size={45} />
            </View>
          )}
          <View className="absolute -bottom-1 right-0 h-10 w-10 items-center justify-center rounded-full bg-primary">
            <ThemedIcon icon={Heart} tone="primaryForeground" filled size={18} />
          </View>
        </View>

        <Text
          className="mt-7 text-[11px] text-primary"
          style={{ letterSpacing: 3 }}
        >
          YOU&apos;RE INVITED
        </Text>
        <Text className="mt-3 text-center font-serif text-[36px] leading-[41px] text-foreground">
          {inviterName} wants you on Youse
        </Text>
        <Text className="mt-3 text-center text-[16px] leading-6 text-muted-foreground">
          Join {inviterName} in a private shared space made for the two of you.
        </Text>
      </View>

      <View className="mt-7 rounded-[28px] border border-white/15 bg-black/25 p-5">
        <InviteDetail label="INVITED AS" value={invitation.partnerName} />
        <InviteDetail
          className="mt-5"
          label="RELATIONSHIP"
          value={formatRelationshipType(invitation.relationshipType)}
        />
        <InviteDetail
          className="mt-5"
          label="YOUR SHARED GOAL"
          value={invitation.goal}
        />
        <InviteDetail
          className="mt-5"
          label="INVITE CODE"
          value={normalizedCode}
        />
      </View>

      <View className="mt-7 rounded-[28px] bg-card p-5">
        <View className="flex-row items-center gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-full bg-primary/15">
            <ThemedIcon icon={Smartphone} size={21} strokeWidth={1.9} />
          </View>
          <View className="flex-1">
            <Text className="font-serif text-[24px] leading-7">Accept on mobile</Text>
            <Text className="mt-1 text-[13px] text-muted-foreground">
              It only takes a minute
            </Text>
          </View>
        </View>

        <View className="mt-5 gap-4">
          <InviteStep number="1" text="Download Youse from your app store." />
          <InviteStep number="2" text="Open this invite in the Youse app." />
          <InviteStep
            number="3"
            text="Review the details, tap Continue, and sign in to accept."
          />
        </View>

        <Button
          className="mt-6 h-15 w-full rounded-full px-5"
          onPress={() => void Linking.openURL(appInviteUrl)}
        >
          <Text className="text-[17px] font-bold text-primary-foreground">
            Open invite in Youse
          </Text>
          <ThemedIcon
            icon={ArrowUpRight}
            tone="primaryForeground"
            size={20}
            strokeWidth={2}
          />
        </Button>

        <View className="mt-3 flex-row gap-3">
          <StoreButton label="App Store" url={APP_STORE_URL} />
          <StoreButton label="Google Play" url={PLAY_STORE_URL} />
        </View>
      </View>

      <Text className="mt-5 text-center text-[12px] leading-5 text-muted-foreground/75">
        Invites are private. Only accept invitations from someone you know.
      </Text>
    </InvitePageFrame>
  );
}

function InvitePageFrame({ children }: { children: React.ReactNode }) {
  return (
    <View className="flex-1 bg-background">
      <Image
        source={heroImage}
        resizeMode="cover"
        className="absolute inset-x-0 top-0 h-[460px] w-full opacity-35"
      />
      <LinearGradient
        colors={["rgba(22,13,17,0.2)", "#160d11"]}
        className="absolute inset-x-0 top-0 h-[460px]"
      />
      <SafeAreaView className="flex-1" style={{ flex: 1 }}>
        <ScrollView
          contentContainerClassName="grow px-6 pb-10"
          showsVerticalScrollIndicator={false}
        >
          <BrandMark
            className="items-start"
            logoClassName="h-20 w-28"
            showTagline
          />
          {children}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function InviteDetail({
  className,
  label,
  value,
}: {
  className?: string;
  label: string;
  value: string;
}) {
  return (
    <View className={className}>
      <Text className="text-[10px] text-placeholder" style={{ letterSpacing: 2.5 }}>
        {label}
      </Text>
      <Text className="mt-1.5 font-serif text-[18px] leading-6">{value}</Text>
    </View>
  );
}

function InviteStep({ number, text }: { number: string; text: string }) {
  return (
    <View className="flex-row items-center gap-3">
      <View className="h-7 w-7 items-center justify-center rounded-full bg-secondary">
        <Text className="text-[12px] font-bold text-secondary-foreground">
          {number}
        </Text>
      </View>
      <Text className="flex-1 text-[14px] leading-5 text-muted-foreground">
        {text}
      </Text>
    </View>
  );
}

function StoreButton({ label, url }: { label: string; url: string }) {
  return (
    <Pressable
      accessibilityRole="link"
      className="h-12 flex-1 flex-row items-center justify-center gap-2 rounded-full border border-white/15 bg-black/15 px-2 transition-colors hover:bg-white/10 focus-visible:ring-[3px] focus-visible:ring-primary/40"
      onPress={() => void Linking.openURL(url)}
    >
      <ThemedIcon icon={Download} size={16} strokeWidth={2} />
      <Text className="text-[13px] font-bold">{label}</Text>
    </Pressable>
  );
}

function formatRelationshipType(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}
