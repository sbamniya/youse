import dayjs, { type Dayjs } from "dayjs";
import { ChevronLeft, ChevronRight, MapPin, Plane, UtensilsCrossed } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Image, Pressable, View } from "react-native";

import { ThemedIcon } from "@/components/app/themed-icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

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

function getCalendarWeeks(month: Dayjs) {
  const startOfMonth = month.startOf("month");
  const daysInMonth = month.daysInMonth();
  // Shift so the week starts on Monday instead of dayjs's default Sunday.
  const leadingBlanks = (startOfMonth.day() + 6) % 7;

  const cells: (number | null)[] = [
    ...Array(leadingBlanks).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (number | null)[][] = [];
  for (let index = 0; index < cells.length; index += 7) {
    weeks.push(cells.slice(index, index + 7));
  }
  return weeks;
}

function PlansCalendar() {
  const [selectedDay, setSelectedDay] = useState(() => dayjs());
  const [month, setMonth] = useState(() => selectedDay.startOf("month"));

  const weeks = useMemo(() => getCalendarWeeks(month), [month]);

  return (
    <>
      {/* Month nav */}
      <View className="mt-4 flex-row items-center justify-between">
        <Text className="font-serif text-[26px] text-foreground">
          {month.format("MMMM YYYY")}
        </Text>
        <View className="flex-row items-center gap-5">
          <Pressable
            accessibilityLabel="Previous month"
            onPress={() => setMonth((current) => current.subtract(1, "month"))}
          >
            <ThemedIcon icon={ChevronLeft} tone="muted" size={20} strokeWidth={2} />
          </Pressable>
          <Pressable
            accessibilityLabel="Next month"
            onPress={() => setMonth((current) => current.add(1, "month"))}
          >
            <ThemedIcon icon={ChevronRight} tone="muted" size={20} strokeWidth={2} />
          </Pressable>
        </View>
      </View>

      {/* Weekday labels */}
      <View className="mt-5 flex-row">
        {WEEKDAYS.map((day) => (
          <Text
            key={day}
            className="flex-1 text-center text-[10px] font-semibold text-muted-foreground"
            style={{ letterSpacing: 1 }}
          >
            {day}
          </Text>
        ))}
      </View>

      {/* Calendar grid */}
      <View className="mt-2">
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} className="flex-row">
            {week.map((day, dayIndex) => {
              const dots = day ? eventDots[day] : undefined;
              const cellDate = day ? month.date(day) : null;
              const isSelected = cellDate ? cellDate.isSame(selectedDay, "day") : false;

              return (
                <Pressable
                  key={dayIndex}
                  className="flex-1 items-center justify-center py-1"
                  disabled={!day}
                  onPress={() => cellDate && setSelectedDay(cellDate)}
                >
                  {day ? (
                    <>
                      <View
                        className={cn(
                          "h-7 w-7 items-center justify-center rounded-full",
                          isSelected && "bg-primary",
                        )}
                      >
                        <Text
                          className={cn(
                            "text-[14px] text-foreground",
                            isSelected && "font-bold text-primary-foreground",
                          )}
                        >
                          {day}
                        </Text>
                      </View>
                      {dots ? (
                        <View className="mt-1 flex-row gap-1">
                          {Array.from({ length: dots }).map((_, dotIndex) => (
                            <View
                              key={dotIndex}
                              className="h-1 w-1 rounded-full bg-primary"
                            />
                          ))}
                        </View>
                      ) : (
                        <View className="mt-1 h-1" />
                      )}
                    </>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>

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
