import { ArrowRight, type LucideIcon } from "lucide-react-native";

import { ThemedIcon } from "@/components/app/themed-icon";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

type PrimaryActionProps = ButtonProps & {
  icon?: LucideIcon;
  label: string;
  showArrow?: boolean;
};

function PrimaryAction({
  className,
  icon,
  label,
  showArrow = false,
  ...props
}: PrimaryActionProps) {
  return (
    <Button className={cn("h-14 rounded-full", className)} {...props}>
      {icon ? (
        <ThemedIcon icon={icon} tone="primaryForeground" size={24} strokeWidth={1.9} />
      ) : null}
      <Text className="text-[18px] font-bold text-primary-foreground">{label}</Text>
      {showArrow ? (
        <ThemedIcon icon={ArrowRight} tone="primaryForeground" size={26} strokeWidth={1.8} />
      ) : null}
    </Button>
  );
}

export { PrimaryAction };
