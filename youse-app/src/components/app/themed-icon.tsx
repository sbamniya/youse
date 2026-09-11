import type { LucideIcon, LucideProps } from "lucide-react-native";
import { useCSSVariable } from "uniwind";

const colorVariables = {
  accent: "--color-accent",
  destructive: "--color-destructive",
  foreground: "--color-foreground",
  muted: "--color-muted-foreground",
  primary: "--color-primary",
  primaryForeground: "--color-primary-foreground",
} as const;

type ThemedIconProps = Omit<LucideProps, "color"> & {
  icon: LucideIcon;
  tone?: keyof typeof colorVariables;
  filled?: boolean;
};

function ThemedIcon({
  icon: Icon,
  tone = "accent",
  filled = false,
  ...props
}: ThemedIconProps) {
  const color = useCSSVariable(colorVariables[tone]) as string;

  return <Icon color={color} fill={filled ? color : "none"} {...props} />;
}

export { ThemedIcon };
