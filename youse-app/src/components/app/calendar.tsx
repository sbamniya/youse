import dayjs, { type Dayjs } from "dayjs";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

import { ThemedIcon } from "@/components/app/themed-icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

type CalendarProps = {
  value: Dayjs;
  onValueChange: (date: Dayjs) => void;
  month?: Dayjs;
  onMonthChange?: (month: Dayjs) => void;
  getMarkerCount?: (date: Dayjs) => number;
  className?: string;
};

function getCalendarWeeks(month: Dayjs) {
  const leadingBlanks = (month.startOf("month").day() + 6) % 7;
  const cells: (number | null)[] = [
    ...Array(leadingBlanks).fill(null),
    ...Array.from({ length: month.daysInMonth() }, (_, index) => index + 1),
  ];

  while (cells.length % 7 !== 0) cells.push(null);

  return Array.from({ length: cells.length / 7 }, (_, index) => cells.slice(index * 7, index * 7 + 7));
}

function Calendar({ value, onValueChange, month: controlledMonth, onMonthChange, getMarkerCount, className }: CalendarProps) {
  const [uncontrolledMonth, setUncontrolledMonth] = useState(() => value.startOf("month"));
  const [openPicker, setOpenPicker] = useState<"month" | "year" | null>(null);
  const month = controlledMonth ?? uncontrolledMonth;
  const setMonth = (update: (current: Dayjs) => Dayjs) => {
    const nextMonth = update(month).startOf("month");
    if (!controlledMonth) setUncontrolledMonth(nextMonth);
    onMonthChange?.(nextMonth);
  };
  const weeks = useMemo(() => getCalendarWeeks(month), [month]);
  const years = useMemo(
    () => Array.from({ length: 126 }, (_, index) => dayjs().year() - 100 + index),
    [],
  );

  return (
    <View className={cn("relative", className)}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View className="relative z-50">
            <Pressable
              accessibilityHint="Shows the available months"
              accessibilityRole="button"
              accessibilityState={{ expanded: openPicker === "month" }}
              className="flex-row items-center gap-1 px-2 py-1"
              onPress={() => setOpenPicker((current) => current === "month" ? null : "month")}
            >
              <Text className="font-serif text-[26px] text-foreground">{MONTHS[month.month()]}</Text>
              <ThemedIcon icon={ChevronDown} size={16} strokeWidth={2} tone="muted" />
            </Pressable>
            {openPicker === "month" ? (
              <View className="absolute left-0 top-full z-50 max-h-60 min-w-40 overflow-hidden rounded-xl border border-border-subtle bg-card p-1 shadow-lg shadow-black/30">
                <ScrollView nestedScrollEnabled showsVerticalScrollIndicator>
                  {MONTHS.map((monthName, index) => (
                    <Pressable
                      key={monthName}
                      accessibilityRole="button"
                      className={cn("rounded-lg px-3 py-2", index === month.month() && "bg-primary")}
                      onPress={() => {
                        setMonth((current) => current.month(index));
                        setOpenPicker(null);
                      }}
                    >
                      <Text className={cn("text-base text-foreground", index === month.month() && "font-semibold text-primary-foreground")}>
                        {monthName}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            ) : null}
          </View>
          <View className="relative z-50">
            <Pressable
              accessibilityHint="Shows the available years"
              accessibilityRole="button"
              accessibilityState={{ expanded: openPicker === "year" }}
              className="flex-row items-center gap-1 px-2 py-1"
              onPress={() => setOpenPicker((current) => current === "year" ? null : "year")}
            >
              <Text className="font-serif text-[26px] text-foreground">{month.year()}</Text>
              <ThemedIcon icon={ChevronDown} size={16} strokeWidth={2} tone="muted" />
            </Pressable>
            {openPicker === "year" ? (
              <View className="absolute left-0 top-full z-50 max-h-60 min-w-40 overflow-hidden rounded-xl border border-border-subtle bg-card p-1 shadow-lg shadow-black/30">
                <ScrollView nestedScrollEnabled showsVerticalScrollIndicator>
                  {years.map((year) => (
                    <Pressable
                      key={year}
                      accessibilityRole="button"
                      className={cn("rounded-lg px-3 py-2", year === month.year() && "bg-primary")}
                      onPress={() => {
                        setMonth((current) => current.year(year));
                        setOpenPicker(null);
                      }}
                    >
                      <Text className={cn("text-base text-foreground", year === month.year() && "font-semibold text-primary-foreground")}>
                        {year}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            ) : null}
          </View>
        </View>
        <View className="flex-row items-center gap-5">
          <Pressable accessibilityLabel="Previous month" onPress={() => setMonth((current) => current.subtract(1, "month"))}>
            <ThemedIcon icon={ChevronLeft} tone="muted" size={20} strokeWidth={2} />
          </Pressable>
          <Pressable accessibilityLabel="Next month" onPress={() => setMonth((current) => current.add(1, "month"))}>
            <ThemedIcon icon={ChevronRight} tone="muted" size={20} strokeWidth={2} />
          </Pressable>
        </View>
      </View>

      <View className="mt-5 flex-row">
        {WEEKDAYS.map((weekday) => (
          <Text key={weekday} className="flex-1 text-center text-[10px] font-semibold text-muted-foreground" style={{ letterSpacing: 1 }}>
            {weekday}
          </Text>
        ))}
      </View>

      <View className="mt-2">
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} className="flex-row">
            {week.map((day, dayIndex) => {
              const date = day ? month.date(day) : null;
              const isSelected = date?.isSame(value, "day");
              const markerCount = date ? getMarkerCount?.(date) ?? 0 : 0;

              return (
                <Pressable
                  key={dayIndex}
                  accessibilityLabel={date?.format("D MMMM YYYY")}
                  accessibilityState={{ selected: isSelected }}
                  className="flex-1 items-center justify-center py-1"
                  disabled={!date}
                  onPress={() => date && onValueChange(date)}
                >
                  {date ? (
                    <>
                      <View className={cn("h-7 w-7 items-center justify-center rounded-full", isSelected && "bg-primary")}>
                        <Text className={cn("text-[14px] text-foreground", isSelected && "font-bold text-primary-foreground")}>
                          {day}
                        </Text>
                      </View>
                      {markerCount ? (
                        <View className="mt-1 flex-row gap-1">
                          {Array.from({ length: markerCount }).map((_, markerIndex) => (
                            <View key={markerIndex} className="h-1 w-1 rounded-full bg-primary" />
                          ))}
                        </View>
                      ) : <View className="mt-1 h-1" />}
                    </>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

export { Calendar };
export type { CalendarProps };
