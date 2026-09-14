import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { CalendarDays, CircleHelp, HeartPulse, UsersRound } from "lucide-react-native";
import { ActivityIndicator, Image, ScrollView, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Line, Polyline } from "react-native-svg";
import { useCSSVariable } from "uniwind";

import { PrimaryAction } from "@/components/app/primary-action";
import { ThemedIcon } from "@/components/app/themed-icon";
import { TrialBadge } from "@/components/app/trial-badge";
import { Text } from "@/components/ui/text";
import {
  currentSpaceQueryOptions,
  getSubscriptionDaysRemaining,
} from "@/lib/current-space";
import { insightsQueryOptions } from "@/lib/insights-api";
import { cn } from "@/lib/utils";

const logo = require("../../../assets/images/logo-full-white.png");

export default function Insight() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [background, primary, border] = useCSSVariable([
    "--color-background", "--color-primary", "--color-border-subtle",
  ]) as [string, string, string];
  const { data: insights, isPending, isError, refetch } = useQuery(insightsQueryOptions);
  const { data: currentSpace } = useQuery(currentSpaceQueryOptions);

  if (isPending) return <View className="flex-1 items-center justify-center bg-background"><ActivityIndicator color={primary} size="large" /></View>;
  if (isError || !insights) {
    return <View className="flex-1 items-center justify-center bg-background px-6">
      <Text className="text-center text-[20px] font-bold text-foreground">We couldn’t load your insights.</Text>
      <Text className="mt-2 text-center font-serif text-[16px] text-primary">Check your connection and try again.</Text>
      <PrimaryAction className="mt-6 w-full" label="Try again" onPress={() => refetch()} />
    </View>;
  }

  const chartWidth = Math.max(width - 88, 260);
  const xFor = (index: number) => 18 + (index * (chartWidth - 36)) / Math.max(insights.moodTrend.length - 1, 1);
  const yFor = (value: number) => 18 + ((5 - value) / 4) * 144;
  const chartSegments: string[][] = [];
  let currentSegment: string[] = [];
  insights.moodTrend.forEach((point, index) => {
    if (point.value === null) {
      if (currentSegment.length) chartSegments.push(currentSegment);
      currentSegment = [];
      return;
    }
    currentSegment.push(`${xFor(index)},${yFor(point.value)}`);
  });
  if (currentSegment.length) chartSegments.push(currentSegment);

  const activityRows = [
    { icon: CircleHelp, label: "Daily questions", progress: `${insights.activity.dailyAnswers} / ${insights.targets.dailyAnswers}`, subtitle: "Little conversations, big closer." },
    { icon: HeartPulse, label: "Mood check-ins", progress: `${insights.activity.moods} / ${insights.targets.moods}`, subtitle: "How you’re feeling, together." },
    { icon: CalendarDays, label: "Weekly check-in", progress: `${insights.activity.weeklyCheckIns} / ${insights.targets.weeklyCheckIns}`, subtitle: "A deeper pause, each week." },
    { icon: UsersRound, label: "Shared plans", progress: `${insights.activity.upcomingPlans} / ${insights.targets.upcomingPlans}`, subtitle: "More life, together." },
  ];
  const subscriptionDaysRemaining = currentSpace
    ? getSubscriptionDaysRemaining(currentSpace)
    : null;

  return <View className="flex-1 bg-background">
    <ScrollView className="flex-1" contentContainerClassName="pb-12" showsVerticalScrollIndicator={false}>
      <View>
        <View className="relative h-44 overflow-hidden">
          <View className="absolute inset-0 bg-black/40" />
          <LinearGradient colors={["transparent", `${background}e6`, background]} locations={[0, 0.68, 1]} className="absolute inset-0" />
          <View className="absolute inset-x-0 top-0 flex-row items-center justify-between px-4" style={{ paddingTop: insets.top + 10 }}>
            <Image source={logo} resizeMode="contain" className="h-16 w-24" />
            {subscriptionDaysRemaining !== null ? <TrialBadge days={subscriptionDaysRemaining} /> : null}
          </View>
          <View className="absolute inset-x-0 bottom-0 px-4 pb-5">
            <Text className="text-[10px] font-medium tracking-[2px] text-muted-foreground">YOUR WEEK TOGETHER</Text>
            <Text className="mt-2 text-[34px] font-bold leading-9 text-foreground">Insights</Text>
            <Text className="mt-1 font-serif text-[16px] text-primary">Small moments, clearer patterns.</Text>
          </View>
        </View>

        <View className="mt-1 border-t border-border-subtle px-4 pt-2">
          <View className="flex-row items-center justify-center">
            <View className="flex-1"><Text className="text-[72px] font-bold leading-[92px] tracking-[-4px] text-foreground">{insights.score}</Text></View>
            <View className="mb-1 ml-5 w-30 border-l border-border-subtle pl-5">
              <Text className="font-serif text-[14px] leading-7 text-primary">Small moments add up to a{"\n"}stronger us.</Text><View className="mt-1 h-px w-8 bg-primary" />
            </View>
          </View>
          <Text className="mt-1 text-[20px] font-bold leading-8 text-foreground">Connection activity</Text>
          <Text className="mt-2 font-serif text-[16px] text-primary">Not a relationship-health score.</Text>
        </View>

        <View className="mt-8 border-t border-border-subtle px-2 pt-7">
          <View className="flex-row items-center justify-between">
            <View><Text className="text-[20px] font-bold text-foreground">Mood check-ins</Text><Text className="mt-1 font-serif text-[14px] text-primary">How you both felt, this week</Text></View>
            <View className="flex-row items-center"><View className="mr-2 h-3 w-3 rounded-full bg-primary" /><Text className="font-serif text-[14px] text-primary">Combined mood</Text></View>
          </View>
          <View className="mt-5 flex-row">
            <View className="w-6 justify-between py-1" style={{ height: 172 }}>{[5, 4, 3, 2, 1].map((value) => <Text key={value} className="text-[14px] text-primary">{value}</Text>)}</View>
            <View className="flex-1">
              <Svg height={172} width={chartWidth}>
                {[18, 54, 90, 126, 162].map((y) => <Line key={y} stroke={border} strokeWidth={1} x1={0} x2={chartWidth} y1={y} y2={y} />)}
                <Line stroke={primary} strokeWidth={1} x1={0} x2={0} y1={18} y2={162} /><Line stroke={primary} strokeWidth={1} x1={0} x2={chartWidth} y1={162} y2={162} />
                {chartSegments.map((segment, index) => <Polyline key={`segment-${index}`} fill="none" points={segment.join(" ")} stroke={primary} strokeWidth={3} />)}
                {insights.moodTrend.map((point, index) => point.value === null ? null : <Circle key={point.date} cx={xFor(index)} cy={yFor(point.value)} fill={primary} r={6.5} />)}
              </Svg>
              <View className="mt-2 flex-row justify-between px-3">{insights.moodTrend.map((point) => <Text key={point.date} className="text-[14px] text-primary">{point.label}</Text>)}</View>
              {chartSegments.length === 0 ? <Text className="mt-4 text-center font-serif text-[14px] text-primary">No mood check-ins yet this week.</Text> : null}
            </View>
          </View>
        </View>

        <View className="mt-8 border-t border-border-subtle px-2 pt-7">
          <Text className="text-[20px] font-bold text-foreground">Your activity this week</Text>
          <Text className="mt-1 font-serif text-[14px] text-primary">Progress on building a brighter us, together.</Text>
          <View className="mt-4">{activityRows.map(({ icon, label, progress, subtitle }, index) => <View key={label} accessibilityLabel={`${label}: ${progress}`} className={cn("flex-row items-center py-4", index > 0 && "border-t border-border-subtle")}>
            <View className="h-10 w-10 items-center justify-center rounded-full bg-secondary"><ThemedIcon icon={icon} size={18} strokeWidth={1.6} /></View>
            <View className="ml-4 flex-1"><Text className="text-[16px] font-bold text-foreground">{label}</Text><Text className="mt-0.5 font-serif text-[14px] text-primary">{subtitle}</Text></View>
            <Text className="text-[16px] font-bold text-foreground">{progress}</Text>
          </View>)}</View>
        </View>
      </View>
    </ScrollView>
  </View>;
}
