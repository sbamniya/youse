import { ChartNoAxesColumnIncreasing, CalendarDays, Heart, House, Images } from 'lucide-react-native';
import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function AppTabs() {
  const isDark = useColorScheme() === 'dark';
  const active = '#DF5B5F';
  const inactive = '#9B949D';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: active,
        tabBarInactiveTintColor: inactive,
        tabBarStyle: {
          backgroundColor: isDark ? '#111016' : '#F4EFE7',
          borderTopColor: isDark ? '#302D35' : '#D8D0C6',
          height: 76,
          paddingTop: 9,
        },
        tabBarLabelStyle: { fontSize: 9 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Today', tabBarIcon: ({ color, size }) => <House color={color} size={size} /> }} />
      <Tabs.Screen name="materials" options={{ title: 'Plans', tabBarIcon: ({ color, size }) => <CalendarDays color={color} size={size} /> }} />
      <Tabs.Screen name="notes" options={{ title: 'Memories', tabBarIcon: ({ color, size }) => <Images color={color} size={size} /> }} />
      <Tabs.Screen name="quizzes" options={{ title: 'Insights', tabBarIcon: ({ color, size }) => <ChartNoAxesColumnIncreasing color={color} size={size} /> }} />
      <Tabs.Screen name="more" options={{ title: 'Us', tabBarIcon: ({ color, size }) => <Heart color={color} size={size} /> }} />
      <Tabs.Screen name="circles" options={{ href: null }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}
