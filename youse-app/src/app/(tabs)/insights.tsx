import { AppScreen } from "@/components/app/app-screen";
import { PageIntro } from "@/components/app/page-intro";

export default function Insights() {
  return (
    <AppScreen className="px-3 pt-2">
      <PageIntro
        eyebrow="INSIGHTS"
        title="Patterns take time."
        description="Once you've answered a few questions together, trends will show up here."
      />
    </AppScreen>
  );
}
