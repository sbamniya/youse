import * as React from "react";
import { TextInput } from "react-native";
import { useCSSVariable } from "uniwind";

import { cn } from "@/lib/utils";

type InputProps = React.ComponentPropsWithoutRef<typeof TextInput> & {
  variant?: "plain" | "rounded" | "underline";
};

const inputVariants = {
  plain: "p-0",
  rounded: "h-12 rounded-2xl border border-input px-4 focus:border-ring",
  underline: "border-b border-border-subtle pb-3",
} as const;

const Input = React.forwardRef<TextInput, InputProps>(function Input(
  { className, variant = "rounded", ...props },
  ref,
) {
  const placeholder = useCSSVariable("--color-placeholder") as string;

  return (
    <TextInput
      ref={ref}
      className={cn(
        "text-base text-foreground",
        inputVariants[variant],
        className,
      )}
      cursorColorClassName="accent-primary"
      placeholderTextColor={placeholder}
      selectionColorClassName="accent-primary"
      {...props}
    />
  );
});

export { Input, type InputProps };
