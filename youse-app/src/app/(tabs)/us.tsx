import { AppScreen } from "@/components/app/app-screen";
import { PageIntro } from "@/components/app/page-intro";

export default function Us() {
  return (
    <AppScreen className="px-3 pt-2">
      <PageIntro
        eyebrow="US"
        title="Your shared Space."
        description="Settings for your connection, trial, and account will live here."
      />
    </AppScreen>
  );
}
