import type { ImageSourcePropType } from "react-native";

export type Memory = {
  id: string;
  title: string;
  dateLabel: string;
  date: string;
  location: string;
  story: string;
  author: string;
  image: ImageSourcePropType;
  photos: MemoryPhoto[];
};

export type MemoryPhoto = {
  id: string;
  image: ImageSourcePropType;
  caption?: string;
};

const ladakhImage = require("../../assets/images/memory-ladakh-hero.png") as ImageSourcePropType;

export const memories: Memory[] = [
  {
    id: "ladakh",
    title: "Ladakh",
    dateLabel: "12 JUN",
    date: "12 June 2026",
    location: "Leh, Ladakh",
    story:
      "We woke before sunrise, drove out with terrible coffee, and somehow ended up having one of our favourite days of the trip.",
    author: "Meera",
    image: ladakhImage,
    photos: [
      { id: "ladakh-sunrise", image: ladakhImage, caption: "The sunrise we nearly slept through." },
      { id: "ladakh-road", image: { uri: "https://images.unsplash.com/photo-1518002054494-3a6f94352e9d?q=80&w=900&auto=format&fit=crop" }, caption: "The road out of Leh, just after six." },
      { id: "ladakh-coffee", image: { uri: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=900&auto=format&fit=crop" }, caption: "Terrible coffee, excellent company." },
    ],
  },
  {
    id: "goa",
    title: "Goa",
    dateLabel: "3 FEB",
    date: "3 February 2026",
    location: "South Goa",
    story:
      "No itinerary. We stayed on the beach until it got dark and found our way home by the light from the shacks.",
    author: "Meera",
    image: {
      uri: "https://images.unsplash.com/photo-1726387871055-35c2c98357f9?q=80&w=1000&auto=format&fit=crop",
    },
    photos: [
      { id: "goa-sunset", image: { uri: "https://images.unsplash.com/photo-1726387871055-35c2c98357f9?q=80&w=1000&auto=format&fit=crop" }, caption: "No plans, just one more sunset." },
      { id: "goa-shore", image: { uri: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=900&auto=format&fit=crop" }, caption: "Feet in the sand until dark." },
    ],
  },
  {
    id: "apartment",
    title: "Our apartment",
    dateLabel: "14 DEC",
    date: "14 December 2025",
    location: "Bengaluru",
    story:
      "The first night with the boxes still unpacked, takeaway on the floor, and the feeling that this little place was finally ours.",
    author: "Arjun",
    image: { uri: "https://picsum.photos/seed/our-apartment/1000/1200" },
    photos: [{ id: "apartment-first-night", image: { uri: "https://picsum.photos/seed/our-apartment/1000/1200" }, caption: "First night, no furniture yet." }],
  },
  {
    id: "diwali",
    title: "Diwali",
    dateLabel: "1 NOV",
    date: "1 November 2025",
    location: "Jaipur",
    story:
      "A balcony full of diyas, too many sweets, and everyone talking over one another in the warmest possible way.",
    author: "Meera",
    image: { uri: "https://picsum.photos/seed/diwali-lights/1000/1200" },
    photos: [{ id: "diwali-balcony", image: { uri: "https://picsum.photos/seed/diwali-lights/1000/1200" }, caption: "The balcony was brighter than the city." }],
  },
];

export const featuredMemory: Memory = memories[1];

export function getMemory(id: string | undefined) {
  return memories.find((memory) => memory.id === id);
}
