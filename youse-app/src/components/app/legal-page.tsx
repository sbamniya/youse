import { router } from "expo-router";
import { View } from "react-native";

import { AppScrollScreen } from "@/components/app/app-screen";
import { PageIntro } from "@/components/app/page-intro";
import { Text } from "@/components/ui/text";

type LegalSection = {
  body: string;
  title: string;
};

type LegalPageProps = {
  description: string;
  eyebrow: string;
  sections: LegalSection[];
  title: string;
};

function LegalPage({ description, eyebrow, sections, title }: LegalPageProps) {
  return (
    <AppScrollScreen contentClassName="px-5 pb-12">
      <PageIntro
        backArrow={{
          onPress: () =>
            router.canGoBack()
              ? router.back()
              : router.replace("/(tabs)/us"),
        }}
        className="mt-4"
        description={description}
        eyebrow={eyebrow}
        title={title}
      />
      <Text className="mt-8 text-[10px] font-medium tracking-[2px] text-muted-foreground">
        LAST UPDATED · SEPTEMBER 2026
      </Text>
      <View className="mt-4 border-t border-border-subtle">
        {sections.map((section) => (
          <View key={section.title} className="border-b border-border-subtle py-5">
            <Text className="text-[17px] font-semibold text-foreground">
              {section.title}
            </Text>
            <Text className="mt-2 font-serif text-[15px] leading-6 text-primary">
              {section.body}
            </Text>
          </View>
        ))}
      </View>
    </AppScrollScreen>
  );
}

export { LegalPage };
export type { LegalPageProps, LegalSection };
