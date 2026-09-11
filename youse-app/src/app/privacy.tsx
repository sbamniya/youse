import { LegalPage } from "@/components/app/legal-page";

const sections = [
  {
    title: "Your shared space",
    body: "Your memories, plans and reflections are visible only to the people you choose to share your space with.",
  },
  {
    title: "What we store",
    body: "We keep the profile details, photos, notes, plans and settings you add so your shared space works across your devices.",
  },
  {
    title: "Your choices",
    body: "You can update your profile, export shared data, or change the information you share from your settings at any time.",
  },
  {
    title: "Keeping things safe",
    body: "We use reasonable safeguards designed to protect your account and the content you choose to keep in Youse.",
  },
];

export default function Privacy() {
  return (
    <LegalPage
      description="A clear look at how your shared space and personal information are handled."
      eyebrow="PRIVACY & DATA"
      sections={sections}
      title="Privacy"
    />
  );
}
