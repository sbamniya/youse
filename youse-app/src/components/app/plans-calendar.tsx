import dayjs from "dayjs";
import { ChevronRight, MapPin, Plane, UtensilsCrossed } from "lucide-react-native";
import { useState } from "react";
import { Image, Pressable, View } from "react-native";

import { Calendar } from "@/components/app/calendar";
import { ThemedIcon } from "@/components/app/themed-icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

const eventDots: Record<number, number> = {
  7: 2,
  18: 1,
};

const upcomingPlans = [
  {
    key: "dinner",
    title: "Dinner at Veronica’s",
    dateLabel: "Tonight, 8:30 PM",
    tag: "VERONICA’S",
    icon: MapPin,
    image: "https://picsum.photos/seed/dinner-veronica/200",
  },
  {
    key: "goa",
    title: "Goa trip",
    dateLabel: "18 Sep",
    tag: "TRAVEL",
    icon: Plane,
    image: "https://picsum.photos/seed/goa-trip/200",
  },
  {
    key: "anniversary",
    title: "Anniversary dinner",
    dateLabel: "3 Oct",
    tag: "SPECIAL OCCASION",
    icon: UtensilsCrossed,
    image: "https://picsum.photos/seed/anniversary-dinner/200",
  },
];

function PlansCalendar() {
  const [selectedDay, setSelectedDay] = useState(() => dayjs());

  return (
    <>
      <Calendar
        className="mt-4"
        getMarkerCount={(date) => eventDots[date.date()] ?? 0}
        onValueChange={setSelectedDay}
        value={selectedDay}
      />

      <View className="my-2 h-px bg-border-subtle" />

      {/* Upcoming plans */}
      <View>
        {upcomingPlans.map((plan, index) => (
          <Pressable
            key={plan.key}
            className={cn(
              "flex-row items-center gap-3.5 py-4",
              index ? "border-t border-border-subtle" : "",
            )}
          >
            <Image
              source={{ uri: plan.image }}
              resizeMode="cover"
              className="h-15 w-15 rounded-2xl"
            />
            <View className="flex-1">
              <Text className="text-[17px] font-semibold text-foreground">
                {plan.title}
              </Text>
              <Text className="mt-0.5 font-serif text-[15px] text-accent">
                {plan.dateLabel}
              </Text>
              <View className="mt-1.5 flex-row items-center gap-1.5">
                <ThemedIcon icon={plan.icon} tone="muted" size={12} strokeWidth={2} />
                <Text
                  className="text-[10px] font-semibold text-muted-foreground"
                  style={{ letterSpacing: 1 }}
                >
                  {plan.tag}
                </Text>
              </View>
            </View>
            <ThemedIcon icon={ChevronRight} tone="muted" size={18} strokeWidth={2} />
          </Pressable>
        ))}
      </View>
    </>
  );
}

export { PlansCalendar };
