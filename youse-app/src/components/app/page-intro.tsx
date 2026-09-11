import { View } from "react-native";

import { BackButton } from "@/components/app/back-button";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

type PageIntroProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  align?: "left" | "center";
  className?: string;
  displayTitle?: boolean;
  backArrow?: {
    onPress: () => void;
  };
};

function PageIntro({
  title,
  description,
  eyebrow,
  align = "left",
  className,
  displayTitle = false,
  backArrow,
}: PageIntroProps) {
  const centered = align === "center";

  return (
    <View className={cn(centered && "items-center", className)}>
      <View className="flex flex-row gap-1 items-center">
        {backArrow && (
          <BackButton className="mr-2" onPress={backArrow.onPress} />
        )}
        {eyebrow ? (
          <Text
            className={cn(
              "text-[12px] text-muted-foreground",
              centered && "text-center",
            )}
            style={{ letterSpacing: 5 }}
          >
            {eyebrow}
          </Text>
        ) : null}
      </View>
      <Text
        className={cn(
          "mt-4 font-bold text-foreground",
          displayTitle ? "text-[36px] leading-11" : "text-[28px] leading-10.75",
          centered && "text-center",
        )}
      >
        {title}
      </Text>
      {description ? (
        <Text
          className={cn(
            "mt-3 font-serif text-[18px] leading-7 text-muted-foreground",
            centered && "text-center",
          )}
        >
          {description}
        </Text>
      ) : null}
    </View>
  );
}

export { PageIntro };
