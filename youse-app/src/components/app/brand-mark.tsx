import { Image, View } from "react-native";

import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

const logo = require("../../../assets/images/icon.png");

type BrandMarkProps = {
  className?: string;
  logoClassName?: string;
  showName?: boolean;
  showTagline?: boolean;
};

function BrandMark({
  className,
  logoClassName,
  showName = false,
  showTagline = false,
}: BrandMarkProps) {
  return (
    <View className={cn("items-center", className)}>
      <Image
        source={logo}
        resizeMode="contain"
        className={cn("h-14 w-14", logoClassName)}
      />
      {showName ? (
        <Text className="mt-1 text-[28px] font-bold text-accent">Youse</Text>
      ) : null}
      {showTagline ? (
        <Text className="mt-1 text-[10px] text-muted-foreground" style={{ letterSpacing: 4 }}>
          A BRIGHTER US, DAILY
        </Text>
      ) : null}
    </View>
  );
}

export { BrandMark };
