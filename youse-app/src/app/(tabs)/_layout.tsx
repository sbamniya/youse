import { Tabs } from "expo-router";
import {
    CalendarDays,
    Home,
    Image as ImageIcon,
    TrendingUp,
    Users,
} from "lucide-react-native";
import { useCSSVariable } from "uniwind";

const tabIcons = {
  today: Home,
  plans: CalendarDays,
  memories: ImageIcon,
  insights: TrendingUp,
  us: Users,
} as const;

export default function TabsLayout() {
  const [background, accent, mutedForeground] = useCSSVariable([
    "--color-background",
    "--color-accent",
    "--color-muted-foreground",
  ]) as [string, string, string];

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: accent,
        tabBarInactiveTintColor: `${mutedForeground}80`,
        tabBarStyle: {
          backgroundColor: background,
          borderTopWidth: 0,
          height: 84,
          paddingTop: 8,
          paddingBottom: 24,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: "500" },
        tabBarIcon: ({ color }) => {
          const Icon = tabIcons[route.name as keyof typeof tabIcons];
          return <Icon color={color} size={22} strokeWidth={1.6} />;
        },
      })}
    >
      <Tabs.Screen name="today" options={{ title: "Today" }} />
      <Tabs.Screen name="plans" options={{ title: "Plans" }} />
      <Tabs.Screen name="memories" options={{ title: "Memories" }} />
      <Tabs.Screen name="insights" options={{ title: "Insights" }} />
      <Tabs.Screen name="us" options={{ title: "Us" }} />
    </Tabs>
  );
}
