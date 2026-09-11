import dayjs, { type Dayjs } from "dayjs";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, View } from "react-native";

import { ThemedIcon } from "@/components/app/themed-icon";
import {
  NativeSelectScrollView,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

function Calendar({ value, onValueChange, getMarkerCount, className }: CalendarProps) {
  const [month, setMonth] = useState(() => value.startOf("month"));
  const weeks = useMemo(() => getCalendarWeeks(month), [month]);
  const years = useMemo(
    () => Array.from({ length: 126 }, (_, index) => dayjs().year() - 100 + index),
    [],
  );

  return (
    <View className={className}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Select
            onValueChange={(option) => {
              if (option) setMonth((current) => current.month(Number(option.value)));
            }}
            value={{ label: MONTHS[month.month()], value: String(month.month()) }}
          >
            <SelectTrigger className="h-auto border-0 bg-transparent px-2 py-1 shadow-none">
              <SelectValue className="font-serif text-[26px] text-foreground" placeholder="Month" />
            </SelectTrigger>
            <SelectContent className="max-h-72" position="popper">
              <NativeSelectScrollView>
                {MONTHS.map((monthName, index) => (
                  <SelectItem key={monthName} label={monthName} value={String(index)} />
                ))}
              </NativeSelectScrollView>
            </SelectContent>
          </Select>
          <Select
            onValueChange={(option) => {
              if (option) setMonth((current) => current.year(Number(option.value)));
            }}
            value={{ label: String(month.year()), value: String(month.year()) }}
          >
            <SelectTrigger className="h-auto border-0 bg-transparent px-2 py-1 shadow-none">
              <SelectValue className="font-serif text-[26px] text-foreground" placeholder="Year" />
            </SelectTrigger>
            <SelectContent className="max-h-72" position="popper">
              <NativeSelectScrollView>
                {years.map((year) => (
                  <SelectItem key={year} label={String(year)} value={String(year)} />
                ))}
              </NativeSelectScrollView>
            </SelectContent>
          </Select>
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
