import { ArrowRight, Check } from "lucide-react-native";
import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { useCSSVariable } from "uniwind";

import { ThemedIcon } from "@/components/app/themed-icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

type ListItem = {
  id: string;
  label: string;
  done: boolean;
};

const CATEGORIES = [
  { id: "date-ideas", label: "Date ideas" },
  { id: "bucket-list", label: "Bucket list" },
  { id: "gifts", label: "Gifts" },
  { id: "topics", label: "Topics" },
] as const;

const initialItems: Record<string, ListItem[]> = {
  "date-ideas": [
    { id: "1", label: "Dinner somewhere new", done: false },
    { id: "2", label: "Sunrise drive", done: false },
    { id: "3", label: "Cook one new recipe", done: true },
    { id: "4", label: "Museum + coffee", done: false },
    { id: "5", label: "One phone-free evening", done: false },
  ],
  "bucket-list": [
    { id: "1", label: "Weekend trip to the mountains", done: false },
    { id: "2", label: "Learn to dance salsa together", done: false },
  ],
  gifts: [
    { id: "1", label: "Surprise flowers", done: false },
    { id: "2", label: "Handwritten letter", done: false },
  ],
  topics: [
    { id: "1", label: "Our 5 year plan", done: false },
    { id: "2", label: "Dream home wishlist", done: false },
  ],
};

function OurLists() {
  const placeholder = useCSSVariable("--color-placeholder") as string;
  const [activeCategory, setActiveCategory] = useState<string>(CATEGORIES[0].id);
  const [itemsByCategory, setItemsByCategory] = useState(initialItems);
  const [newIdea, setNewIdea] = useState("");

  const items = itemsByCategory[activeCategory] ?? [];
  const doneCount = items.filter((item) => item.done).length;

  function toggleItem(id: string) {
    setItemsByCategory((current) => ({
      ...current,
      [activeCategory]: current[activeCategory].map((item) =>
        item.id === id ? { ...item, done: !item.done } : item,
      ),
    }));
  }

  function addIdea() {
    const label = newIdea.trim();
    if (!label) return;
    setItemsByCategory((current) => ({
      ...current,
      [activeCategory]: [
        ...(current[activeCategory] ?? []),
        { id: Date.now().toString(), label, done: false },
      ],
    }));
    setNewIdea("");
  }

  return (
    <>
      {/* Category tabs */}
      <View className="mt-6 flex-row gap-5">
        {CATEGORIES.map((category) => {
          const active = category.id === activeCategory;
          return (
            <Pressable key={category.id} onPress={() => setActiveCategory(category.id)}>
              <Text
                className={cn(
                  "font-serif text-[19px]",
                  active ? "font-bold text-foreground" : "text-accent",
                )}
              >
                {category.label}
              </Text>
              {active ? <View className="mt-1.5 h-0.5 w-full bg-primary" /> : null}
            </Pressable>
          );
        })}
      </View>

      <Text className="mt-5 text-[13px] text-muted-foreground">
        {items.length} ideas · {doneCount} done
      </Text>

      {/* Items */}
      <View className="mt-3">
        {items.map((item, index) => (
          <Pressable
            key={item.id}
            className={cn(
              "flex-row items-center gap-4 py-4",
              index ? "border-t border-border-subtle" : "",
            )}
            onPress={() => toggleItem(item.id)}
          >
            <View
              className={cn(
                "h-8 w-8 items-center justify-center rounded-full border",
                item.done ? "border-primary bg-primary" : "border-foreground/30",
              )}
            >
              {item.done ? (
                <ThemedIcon icon={Check} tone="primaryForeground" size={16} strokeWidth={2.4} />
              ) : null}
            </View>
            <Text
              className={cn(
                "flex-1 text-[18px]",
                item.done ? "font-serif italic text-foreground" : "text-foreground",
              )}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Add an idea */}
      <View className="mt-4 flex-row items-center rounded-full bg-secondary/60 py-1.5 pl-5 pr-1.5">
        <TextInput
          className="flex-1 text-[16px] text-foreground"
          onChangeText={setNewIdea}
          onSubmitEditing={addIdea}
          placeholder="Add an idea…"
          placeholderTextColor={placeholder}
          returnKeyType="done"
          value={newIdea}
        />
        <Pressable
          accessibilityLabel="Add idea"
          className="h-11 w-11 items-center justify-center rounded-full bg-primary"
          onPress={addIdea}
        >
          <ThemedIcon icon={ArrowRight} tone="primaryForeground" size={20} strokeWidth={2} />
        </Pressable>
      </View>
    </>
  );
}

export { OurLists };
