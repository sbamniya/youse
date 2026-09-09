import { LinearGradient } from "expo-linear-gradient";
import {
    Check,
    ChevronRight,
    Pencil,
    Plane,
    Smile,
    UtensilsCrossed,
} from "lucide-react-native";
import { useState } from "react";
import { Image, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCSSVariable } from "uniwind";

import { ThemedIcon } from "@/components/app/themed-icon";
import { Text } from "@/components/ui/text";

const logo = require("../../../assets/images/icon.png");

const heroImage =
  "https://images.unsplash.com/photo-1726387871055-35c2c98357f9?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
const meeraImage =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=700&auto=format&fit=crop";
const arjunImage =
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=700&auto=format&fit=crop";

const moods = ["😔", "😐", "🙂", "😌", "😄"];

const plans = [
  {
    key: "dinner",
    eyebrow: "TONIGHT",
    title: "Dinner at Veronica’s",
    sub: "8:30 PM",
    icon: UtensilsCrossed,
    colors: ["#1e3832", "#163028"] as const,
  },
  {
    key: "goa",
    eyebrow: "COUNTDOWN",
    title: "12",
    sub: "days until Goa",
    icon: Plane,
    colors: ["#1a3a52", "#1e3558"] as const,
    isCountdown: true,
  },
];

const pokeRows = [
  ["Thinking of you", "Proud of you"],
  ["Miss you", "Call me"],
];

export default function Today() {
  const insets = useSafeAreaInsets();
  const [background] = useCSSVariable(["--color-background"]) as [string];
  const [activeMood, setActiveMood] = useState(2);

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="pb-8"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View className="relative overflow-hidden" style={{ height: 460 }}>
          <Image
            source={{ uri: heroImage }}
            resizeMode="cover"
            className="absolute inset-0 h-full w-full"
          />
          <View className="absolute inset-0 bg-black/35" />
          <LinearGradient
            colors={["transparent", `${background}cc`, background]}
            locations={[0, 0.55, 1]}
            className="absolute inset-0"
          />

          <View
            className="absolute inset-x-0 top-0 flex-row items-start justify-between px-5"
            style={{ paddingTop: insets.top + 10 }}
          >
            <View className="items-start">
              <View className="flex-row items-center gap-1.5">
                <Image
                  source={logo}
                  resizeMode="contain"
                  className="h-6 w-6"
                />
                <Text className="font-serif text-[17px] font-semibold text-foreground">
                  Youse
                </Text>
              </View>
              <Text
                className="mt-0.5 text-[9px] font-medium text-muted-foreground"
                style={{ letterSpacing: 2 }}
              >
                A BRIGHTER US, DAILY
              </Text>
            </View>

            <View className="flex-row items-center gap-2">
              <View className="flex-row items-center gap-1 rounded-full border border-primary/35 bg-background/60 px-2.5 py-1.5">
                <Text className="text-[11px] font-medium text-accent">
                  14 days left
                </Text>
              </View>
              <Image
                source={{ uri: meeraImage }}
                resizeMode="cover"
                className="h-9 w-9 rounded-full border border-foreground/25"
              />
            </View>
          </View>

          <View className="absolute inset-x-0 bottom-0 px-6 pb-6">
            <Text
              className="text-[10px] font-medium text-muted-foreground"
              style={{ letterSpacing: 2 }}
            >
              Wednesday, September 9, 2026
            </Text>
            <Text className="mt-3 font-serif text-[34px] font-semibold leading-9 text-foreground">
              What’s something you wish we did more often?
            </Text>

            <View className="mt-3 flex-row items-end justify-between">
              <Text className="max-w-[180px] font-serif text-[15px] italic leading-5 text-muted-foreground">
                Small answers make a big difference.
              </Text>
              <Text className="text-right font-serif text-[13px] italic leading-4 text-muted-foreground">
                Same{"\n"}Team{"\n"}Always ♡
              </Text>
            </View>

            <Pressable className="mt-5 flex-row items-center justify-center gap-2.5 rounded-full border border-primary/25 bg-primary/15 py-4">
              <ThemedIcon icon={Pencil} size={16} strokeWidth={1.8} />
              <Text className="text-[15px] font-medium text-foreground">
                Write my answer
              </Text>
            </Pressable>

            <View className="mt-5 flex-row items-center">
              <View className="flex-1 flex-row items-center gap-2.5">
                <View className="relative h-11 w-11">
                  <Image
                    source={{ uri: meeraImage }}
                    resizeMode="cover"
                    className="h-11 w-11 rounded-full border-2 border-foreground/10"
                  />
                  <View className="absolute -bottom-0.5 -right-0.5 h-4 w-4 items-center justify-center rounded-full border-2 border-background bg-primary">
                    <Check color="#1d1115" size={9} strokeWidth={3} />
                  </View>
                </View>
                <View>
                  <Text className="text-[14px] font-semibold text-foreground">
                    You
                  </Text>
                  <Text className="text-[12px] text-muted-foreground">
                    Answered Today
                  </Text>
                </View>
              </View>

              <View className="mx-1 h-9 w-px bg-foreground/10" />

              <View className="flex-1 flex-row items-center gap-2.5 pl-1">
                <View className="relative h-11 w-11">
                  <Image
                    source={{ uri: arjunImage }}
                    resizeMode="cover"
                    className="h-11 w-11 rounded-full border-2 border-foreground/10"
                  />
                  <View className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-background bg-transparent" />
                </View>
                <View>
                  <Text className="text-[14px] font-semibold text-foreground">
                    Arjun
                  </Text>
                  <Text className="text-[12px] text-muted-foreground">
                    Hasn’t answered yet
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Our mood today */}
        <View className="px-4 pt-5">
          <Text
            className="text-[10px] font-semibold text-muted-foreground"
            style={{ letterSpacing: 2 }}
          >
            OUR MOOD TODAY
          </Text>
          <Text className="mt-2.5 text-[13px] text-muted-foreground">
            How are you feeling?
          </Text>

          <View className="mt-2.5 flex-row gap-2">
            {moods.map((emoji, index) => (
              <Pressable
                key={emoji}
                onPress={() => setActiveMood(index)}
                className={`aspect-square flex-1 items-center justify-center rounded-xl border ${
                  index === activeMood
                    ? "border-primary/45 bg-primary/15"
                    : "border-border-subtle bg-card"
                }`}
              >
                <Text className="text-[20px]">{emoji}</Text>
              </Pressable>
            ))}
          </View>

          <View className="mt-4 flex-row items-center gap-3 rounded-2xl border border-border-subtle bg-card p-3.5">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/15">
              <ThemedIcon icon={Smile} size={20} strokeWidth={1.6} />
            </View>
            <View className="flex-1">
              <Text className="font-serif text-[18px] font-semibold leading-5 text-foreground">
                Calm &amp; Close
              </Text>
              <Text
                className="text-[10px] font-semibold text-muted-foreground"
                style={{ letterSpacing: 1 }}
              >
                A little brighter than yesterday
              </Text>
            </View>
            <Text className="max-w-[105px] text-right font-serif text-[12px] italic leading-4 text-muted-foreground">
              A more connected life is a kinder life.
            </Text>
          </View>
        </View>

        <View className="mx-4 my-5 h-px bg-border-subtle" />

        {/* Next up */}
        <View className="px-4">
          <Text
            className="text-[10px] font-semibold text-muted-foreground"
            style={{ letterSpacing: 2 }}
          >
            NEXT UP
          </Text>
          <View className="mt-2.5 flex-row gap-2.5">
            {plans.map((plan) => (
              <View
                key={plan.key}
                className="flex-1 overflow-hidden rounded-2xl border border-border-subtle bg-card"
              >
                <View className="p-3 pb-2">
                  <Text
                    className="text-[9px] font-semibold text-muted-foreground"
                    style={{ letterSpacing: 1.5 }}
                  >
                    {plan.eyebrow}
                  </Text>
                  <Text
                    className={
                      plan.isCountdown
                        ? "font-serif text-[32px] font-light leading-9 text-foreground"
                        : "mt-0.5 font-serif text-[16px] font-semibold leading-5 text-foreground"
                    }
                  >
                    {plan.title}
                  </Text>
                  <Text className="mt-0.5 text-[11px] text-muted-foreground">
                    {plan.sub}
                  </Text>
                </View>
                <LinearGradient
                  colors={plan.colors}
                  className="h-16 items-center justify-center"
                >
                  <ThemedIcon icon={plan.icon} size={26} strokeWidth={1.3} />
                </LinearGradient>
              </View>
            ))}
          </View>
        </View>

        <View className="mx-4 my-5 h-px bg-border-subtle" />

        {/* From Arjun */}
        <View className="px-4">
          <Text
            className="text-[10px] font-semibold text-muted-foreground"
            style={{ letterSpacing: 2 }}
          >
            FROM ARJUN
          </Text>
          <Pressable className="mt-2.5 flex-row items-center gap-3 rounded-2xl border border-border-subtle bg-card p-3.5">
            <Image
              source={{ uri: arjunImage }}
              resizeMode="cover"
              className="h-10 w-10 rounded-full"
            />
            <View className="flex-1">
              <Text className="text-[14px] font-semibold text-foreground">
                Shared a photo
              </Text>
              <Text className="text-[12px] text-muted-foreground">
                22 minutes ago
              </Text>
            </View>
            <ThemedIcon
              icon={ChevronRight}
              tone="muted"
              size={18}
              strokeWidth={2}
            />
          </Pressable>
        </View>

        <View className="mx-4 my-5 h-px bg-border-subtle" />

        {/* Send a poke */}
        <View className="px-4">
          <View className="flex-row items-baseline justify-between">
            <Text
              className="text-[10px] font-semibold text-muted-foreground"
              style={{ letterSpacing: 2 }}
            >
              SEND A POKE
            </Text>
            <Text className="text-[12px] text-muted-foreground">
              to <Text className="font-medium text-accent">Arjun</Text>
            </Text>
          </View>
          <Text className="mt-1.5 text-[12px] text-muted-foreground">
            A tiny signal, no conversation required.
          </Text>
          <View className="mt-2.5 gap-2">
            {pokeRows.map((row) => (
              <View key={row.join("-")} className="flex-row gap-2">
                {row.map((label) => (
                  <Pressable
                    key={label}
                    className="flex-1 items-center rounded-full border border-border-subtle bg-card px-3.5 py-3"
                  >
                    <Text className="text-[13px] text-foreground">
                      {label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
