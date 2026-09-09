import { AppScreen } from "@/components/app/app-screen";
import { PageIntro } from "@/components/app/page-intro";

export default function Memories() {
  return (
    <AppScreen className="px-3 pt-2">
      <PageIntro
        eyebrow="MEMORIES"
        title="Your story starts here."
        description="Photos and moments you save together will live in this space."
      />
    </AppScreen>
  );
}
