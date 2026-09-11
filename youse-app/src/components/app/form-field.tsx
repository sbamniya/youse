import { View } from "react-native";

import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";

type FormFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  multiline?: boolean;
};

function FormField({
  label,
  placeholder,
  value,
  onChangeText,
  multiline = false,
}: FormFieldProps) {
  return (
    <View className="mt-6">
      <Text
        className="text-[11px] font-semibold text-muted-foreground"
        style={{ letterSpacing: 2 }}
      >
        {label.toUpperCase()}
      </Text>
      <Input
        className="mt-2 text-[18px]"
        multiline={multiline}
        onChangeText={onChangeText}
        placeholder={placeholder}
        variant="underline"
        value={value}
      />
    </View>
  );
}

export { FormField };
