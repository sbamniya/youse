import { X } from "lucide-react-native";
import { Pressable, ScrollView, View } from "react-native";

import { ThemedIcon } from "@/components/app/themed-icon";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

const times = Array.from({ length: 46 }, (_, index) => {
  const totalMinutes = 60 + index * 30;
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  const period = hour < 12 ? "AM" : "PM";
  const displayHour = hour % 12 || 12;

  return `${String(displayHour).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${period}`;
});

type TimePickerDialogProps = {
  description: string;
  disabled?: boolean;
  error?: string;
  onOpenChange: (open: boolean) => void;
  onSelect: (time: string) => void;
  open: boolean;
  title: string;
  value: string;
};

export function TimePickerDialog({
  description,
  disabled = false,
  error,
  onOpenChange,
  onSelect,
  open,
  title,
  value,
}: TimePickerDialogProps) {
  return (
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      <AlertDialogContent className="mx-4 self-stretch rounded-3xl border-border-subtle bg-card p-5 web:mx-0 web:self-center">
        <AlertDialogHeader className="relative pr-12">
          <AlertDialogTitle className="text-left text-[22px] text-foreground">
            {title}
          </AlertDialogTitle>
          <AlertDialogCancel
            accessibilityLabel="Close time picker"
            className="absolute -right-1 -top-1 h-10 w-10 items-center justify-center rounded-full border-0 bg-transparent p-0 active:bg-muted"
          >
            <ThemedIcon icon={X} size={19} strokeWidth={2} />
          </AlertDialogCancel>
        </AlertDialogHeader>
        <Text className="-mt-2 font-serif text-[14px] text-muted-foreground">
          {description}
        </Text>
        {error ? (
          <Text className="font-serif text-[14px] text-destructive">{error}</Text>
        ) : null}
        <ScrollView className="max-h-80" showsVerticalScrollIndicator={false}>
          <View className="-mx-1 flex-row flex-wrap">
            {times.map((time) => {
              const isSelected = time === value;

              return (
                <View key={time} className="w-1/2 p-1">
                  <Pressable
                    accessibilityRole="radio"
                    accessibilityState={{ checked: isSelected, disabled }}
                    className={cn(
                      "h-11 items-center justify-center rounded-xl border active:opacity-75",
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-border-subtle bg-background",
                    )}
                    disabled={disabled}
                    onPress={() => onSelect(time)}
                  >
                    <Text
                      className={cn(
                        "text-[14px] font-semibold",
                        isSelected
                          ? "text-primary-foreground"
                          : "text-foreground",
                      )}
                    >
                      {time}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </AlertDialogContent>
    </AlertDialog>
  );
}
