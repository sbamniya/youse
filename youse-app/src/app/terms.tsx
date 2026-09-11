import { LegalPage } from "@/components/app/legal-page";

const sections = [
  {
    title: "Using Youse together",
    body: "Youse is a private space for two people to keep memories, make plans and build everyday rituals together.",
  },
  {
    title: "Your account",
    body: "Keep your account details accurate and protect access to your device and invite links. You are responsible for the content you add to your space.",
  },
  {
    title: "Shared content",
    body: "Only share photos, notes and plans that you have the right to share. Treat your partner’s personal information with care.",
  },
  {
    title: "Changes to Youse",
    body: "As Youse grows, features and these terms may change. We’ll make the latest version available here when that happens.",
  },
];

export default function Terms() {
  return (
    <LegalPage
      description="The simple guidelines for using your shared space with care."
      eyebrow="TERMS & CONDITIONS"
      sections={sections}
      title="Terms"
    />
  );
}
