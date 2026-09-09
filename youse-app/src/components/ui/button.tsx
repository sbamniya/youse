import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { Platform, Pressable } from "react-native";

import { TextClassContext } from "@/components/ui/text";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group shrink-0 flex-row items-center justify-center gap-2 rounded-md",
  {
    variants: {
      variant: {
        default: "bg-primary active:bg-primary/90",
        link: "",
      },
      size: {
        default: "h-10 px-4 py-2",
        lg: "h-11 rounded-md px-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const buttonTextVariants = cva("text-foreground text-sm font-medium", {
  variants: {
    variant: {
      default: "text-primary-foreground",
      link: "text-primary underline",
    },
    size: {
      default: "",
      lg: "",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

type ButtonProps = React.ComponentProps<typeof Pressable> &
  VariantProps<typeof buttonVariants>;

function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <TextClassContext.Provider value={buttonTextVariants({ variant, size })}>
      <Pressable
        accessibilityRole="button"
        className={cn(
          props.disabled && "opacity-50",
          buttonVariants({ variant, size }),
          Platform.select({ web: "transition-opacity" }),
          className,
        )}
        {...props}
      />
    </TextClassContext.Provider>
  );
}

export { Button, buttonTextVariants, buttonVariants };
export type { ButtonProps };

