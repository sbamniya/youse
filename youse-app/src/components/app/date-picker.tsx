import dayjs, { type Dayjs } from "dayjs";
import { X } from "lucide-react-native";
import { type ReactElement, useState } from "react";
import { Pressable, View } from "react-native";

import { Calendar } from "@/components/app/calendar";
import { ThemedIcon } from "@/components/app/themed-icon";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Text } from "@/components/ui/text";

type DatePickerTriggerProps = {
  displayValue: string;
  isPlaceholder: boolean;
  onPress: () => void;
};

type DatePickerProps = {
  children: (props: DatePickerTriggerProps) => ReactElement;
  format?: string;
  onValueChange: (date: Dayjs) => void;
  placeholder?: string;
  title?: string;
  value: Dayjs | null;
};

function DatePicker({
  children,
  format = "DD MMM YYYY",
  onValueChange,
  placeholder = "Choose a date",
  title = "Choose a date",
  value,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const displayValue = value ? value.format(format) : placeholder;

  return (
    <AlertDialog onOpenChange={setOpen} open={open}>
      <AlertDialogTrigger asChild>
        {children({
          displayValue,
          isPlaceholder: value === null,
          onPress: () => setOpen(true),
        })}
      </AlertDialogTrigger>
      <AlertDialogContent className="mx-4 w-[calc(100%-2rem)] rounded-3xl border-border-subtle bg-card p-5">
        <AlertDialogHeader className="relative pr-12">
          <AlertDialogTitle className="text-left text-[22px] text-foreground">{title}</AlertDialogTitle>
          <AlertDialogCancel
            accessibilityLabel="Close date picker"
            className="absolute -right-1 -top-1 h-10 w-10 items-center justify-center rounded-full border-0 bg-transparent p-0 active:bg-muted"
          >
            <ThemedIcon icon={X} size={19} strokeWidth={2} />
          </AlertDialogCancel>
        </AlertDialogHeader>
        <Calendar
          className="mt-1"
          onValueChange={(date) => {
            onValueChange(date);
            setOpen(false);
          }}
          value={value ?? dayjs()}
        />
      </AlertDialogContent>
    </AlertDialog>
  );
}

type DatePickerFieldProps = Omit<DatePickerProps, "children"> & {
  label: string;
};

function DatePickerField({ label, ...props }: DatePickerFieldProps) {
  return (
    <View className="mt-6">
      <Text className="text-[11px] font-semibold tracking-[2px] text-muted-foreground">{label.toUpperCase()}</Text>
      <DatePicker {...props}>
        {({ displayValue, isPlaceholder, onPress }) => (
          <Pressable
            accessibilityLabel={`Choose ${label.toLowerCase()}`}
            className="mt-2 border-b border-input py-2.5 active:opacity-70"
            onPress={onPress}
          >
            <Text className={isPlaceholder ? "text-[18px] text-muted-foreground" : "text-[18px] text-foreground"}>
              {displayValue}
            </Text>
          </Pressable>
        )}
      </DatePicker>
    </View>
  );
}

export { DatePicker, DatePickerField };
export type { DatePickerProps, DatePickerTriggerProps };
