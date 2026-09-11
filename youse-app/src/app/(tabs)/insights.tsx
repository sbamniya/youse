import { LinearGradient } from "expo-linear-gradient";
import {
  CalendarDays,
  ChevronRight,
  CircleHelp,
  HeartPulse,
  UsersRound,
} from "lucide-react-native";
import { Alert, Image, Pressable, ScrollView, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Line, Polyline } from "react-native-svg";
import { useCSSVariable } from "uniwind";

import { ThemedIcon } from "@/components/app/themed-icon";
import { Text } from "@/components/ui/text";

const logo = require("../../../assets/images/logo-full-white.png");
const insightHeroImage =
  "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop";

const moodData = [
  { label: "Mon", value: 3 },
  { label: "Tue", value: 4 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 3.5 },
  { label: "Sat", value: 4.5 },
  { label: "Sun", value: 4 },
];

const weeklyActivity = [
  {
    icon: CircleHelp,
    label: "Daily questions",
    progress: "29 / 35",
    subtitle: "Little conversations, big closer.",
  },
  {
    icon: HeartPulse,
    label: "Mood check-ins",
    progress: "17 / 20",
    subtitle: "How you’re feeling, together.",
  },
  {
    icon: CalendarDays,
    label: "Weekly check-in",
    progress: "25 / 25",
    subtitle: "A deeper pause, each week.",
  },
  {
    icon: UsersRound,
    label: "Shared plans",
    progress: "11 / 20",
    subtitle: "More life, together.",
  },
];

export default function Insight() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [background, primary, border] = useCSSVariable([
    "--color-background",
    "--color-primary",
    "--color-border-subtle",
  ]) as [string, string, string];
  const chartWidth = Math.max(width - 88, 260);
  const chartPoints = moodData
    .map(({ value }, index) => {
      const x = 18 + (index * (chartWidth - 36)) / (moodData.length - 1);
      const y = 18 + ((5 - value) / 4) * 144;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-12"
        showsVerticalScrollIndicator={false}
      >
        <View>
          <View className="relative h-40 overflow-hidden">
            <View className="absolute inset-0 bg-black/40" />
            <LinearGradient
              colors={["transparent", `${background}e6`, background]}
              locations={[0, 0.68, 1]}
              className="absolute inset-0"
            />

            <View
              className="absolute inset-x-0 top-0 flex-row items-start justify-between px-4"
              style={{ paddingTop: insets.top + 10 }}
            >
              <View>
                <Image source={logo} resizeMode="contain" className="h-6 w-16" />
                <Text className="mt-0.5 text-[9px] font-medium tracking-[2px] text-muted-foreground">
                  A BRIGHTER US, DAILY
                </Text>
              </View>
              <View className="rounded-full border border-primary/35 bg-background/60 px-2.5 py-1.5">
                <Text className="text-[11px] font-medium text-accent">11 days left</Text>
              </View>
            </View>

            <View className="absolute inset-x-0 bottom-0 px-4 pb-5">
              <Text className="text-[10px] font-medium tracking-[2px] text-muted-foreground">
                YOUR WEEK TOGETHER
              </Text>
              <Text className="mt-2 text-[34px] font-bold leading-9 text-foreground">Insights</Text>
              <Text className="mt-1 font-serif text-[16px] text-primary">
                Small moments, clearer patterns.
              </Text>
            </View>
          </View>

          <View className="mt-1 border-t border-border-subtle px-4 pt-2">
            <View className="flex-row items-center justify-center">
              <View className="flex-1">
                <Text className="text-[72px] font-bold leading-[92px] tracking-[-4px] text-foreground">82</Text>
              </View>
              <View className="mb-1 ml-5 w-30 border-l border-border-subtle pl-5">
                <Text className="font-serif text-[14px] leading-7 text-primary">
                  Small moments add up to a{"\n"}stronger us.
                </Text>
                <View className="mt-1 h-px w-8 bg-primary" />
              </View>
            </View>
            <Text className="mt-1 text-[20px] font-bold leading-8 text-foreground">
              Connection activity
            </Text>
            <Text className="mt-2 font-serif text-[16px] text-primary">
              Not a relationship-health score.
            </Text>
          </View>

          <View className="mt-8 border-t border-border-subtle px-2 pt-7">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-[24px] font-bold text-foreground">Mood check-ins</Text>
                <Text className="mt-1 font-serif text-[18px] text-primary">
                  How you both felt, this week
                </Text>
              </View>
              <View className="flex-row items-center">
                <View className="mr-2 h-3 w-3 rounded-full bg-primary" />
                <Text className="font-serif text-[15px] text-primary">Combined mood</Text>
              </View>
            </View>

            <View className="mt-5">
              <View className="flex-row">
                <View className="w-6 justify-between py-1" style={{ height: 172 }}>
                  {[5, 4, 3, 2, 1].map((value) => (
                    <Text key={value} className="text-[14px] text-primary">{value}</Text>
                  ))}
                </View>
                <View className="flex-1">
                  <Svg height={172} width={chartWidth}>
                    {[18, 54, 90, 126, 162].map((y) => (
                      <Line key={y} stroke={border} strokeWidth={1} x1={0} x2={chartWidth} y1={y} y2={y} />
                    ))}
                    <Line stroke={primary} strokeWidth={1} x1={0} x2={0} y1={18} y2={162} />
                    <Line stroke={primary} strokeWidth={1} x1={0} x2={chartWidth} y1={162} y2={162} />
                    <Polyline fill="none" points={chartPoints} stroke={primary} strokeWidth={3} />
                    {moodData.map(({ label, value }, index) => {
                      const x = 18 + (index * (chartWidth - 36)) / (moodData.length - 1);
                      const y = 18 + ((5 - value) / 4) * 144;

                      return <Circle key={label} cx={x} cy={y} fill={primary} r={6.5} />;
                    })}
                  </Svg>
                  <View className="mt-2 flex-row justify-between px-3">
                    {moodData.map(({ label }) => (
                      <Text key={label} className="text-[14px] text-primary">{label}</Text>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View className="mt-8 border-t border-border-subtle px-2 pt-7">
            <Text className="text-[24px] font-bold text-foreground">Your activity this week</Text>
            <Text className="mt-1 font-serif text-[18px] text-primary">
              Progress on building a brighter us, together.
            </Text>

            <View className="mt-4">
              {weeklyActivity.map(({ icon, label, progress, subtitle }, index) => (
                <Pressable
                  key={label}
                  accessibilityLabel={`${label}: ${progress}`}
                  className={`flex-row items-center py-4 ${index ? "border-t border-border-subtle" : ""}`}
                  onPress={() => Alert.alert(label, subtitle)}
                >
                  <View className="h-14 w-14 items-center justify-center rounded-full bg-secondary">
                    <ThemedIcon icon={icon} size={28} strokeWidth={1.6} />
                  </View>
                  <View className="ml-4 flex-1">
                    <Text className="text-[19px] font-bold text-foreground">{label}</Text>
                    <Text className="mt-0.5 font-serif text-[15px] text-primary">{subtitle}</Text>
                  </View>
                  <Text className="text-[21px] font-bold text-foreground">{progress}</Text>
                  <ThemedIcon className="ml-3" icon={ChevronRight} size={23} strokeWidth={1.8} />
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
