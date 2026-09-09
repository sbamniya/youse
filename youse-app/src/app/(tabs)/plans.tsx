import { AppScreen } from "@/components/app/app-screen";
import { PageIntro } from "@/components/app/page-intro";

export default function Plans() {
  return (
    <AppScreen className="px-3 pt-2">
      <PageIntro
        eyebrow="PLANS"
        title="Nothing planned yet."
        description="Dates, trips, and countdowns you both add will show up here."
      />
    </AppScreen>
  );
}
