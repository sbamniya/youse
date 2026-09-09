import * as React from "react";
import { TextInput } from "react-native";
import { useCSSVariable } from "uniwind";

import { cn } from "@/lib/utils";

function Input({ className, ...props }: React.ComponentProps<typeof TextInput>) {
  const placeholder = useCSSVariable("--color-placeholder") as string;

  return (
    <TextInput
      className={cn(
        "h-12 rounded-2xl border border-input px-4 text-base text-foreground focus:border-ring",
        className,
      )}
      cursorColorClassName="accent-primary"
      placeholderTextColor={placeholder}
      selectionColorClassName="accent-primary"
      {...props}
    />
  );
}

export { Input };
