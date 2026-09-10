import { TextInput, View } from "react-native";
import { useCSSVariable } from "uniwind";

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
  const placeholderColor = useCSSVariable("--color-placeholder") as string;

  return (
    <View className="mt-6">
      <Text
        className="text-[11px] font-semibold text-muted-foreground"
        style={{ letterSpacing: 2 }}
      >
        {label.toUpperCase()}
      </Text>
      <TextInput
        className="mt-2 border-b border-border-subtle pb-3 text-[18px] text-foreground"
        multiline={multiline}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
        value={value}
      />
    </View>
  );
}

export { FormField };
