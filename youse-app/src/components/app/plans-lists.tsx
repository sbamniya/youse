import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Check, Plus } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";

import { ThemedIcon } from "@/components/app/themed-icon";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import {
  createList,
  createListItem,
  listsQueryKey,
  listsQueryOptions,
  type SharedList,
  updateListItem,
} from "@/lib/lists-api";
import { cn } from "@/lib/utils";

function OurLists() {
  const queryClient = useQueryClient();
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newListName, setNewListName] = useState("");
  const [isCreateListOpen, setIsCreateListOpen] = useState(false);
  const { data: lists = [], isError, isPending, refetch } = useQuery(listsQueryOptions);
  const activeList = lists.find((list) => list.id === activeListId) ?? lists[0];

  const createListMutation = useMutation({
    mutationFn: () => createList(newListName.trim()),
    onSuccess: (list) => {
      queryClient.setQueryData<SharedList[]>(listsQueryKey, (current) => [
        ...(current ?? []),
        { ...list, items: list.items ?? [] },
      ]);
      setActiveListId(list.id);
      setNewListName("");
      setIsCreateListOpen(false);
    },
  });
  const createItemMutation = useMutation({
    mutationFn: ({ listId, title }: { listId: string; title: string }) =>
      createListItem(listId, title),
    onSuccess: (item) => {
      queryClient.setQueryData<SharedList[]>(listsQueryKey, (current) =>
        current?.map((list) =>
          list.id === item.listId
            ? { ...list, items: [...list.items, item] }
            : list,
        ),
      );
      setNewItemTitle("");
    },
  });
  const updateItemMutation = useMutation({
    mutationFn: ({ itemId, completed }: { itemId: string; completed: boolean }) =>
      updateListItem(itemId, { completed }),
    onSuccess: (updatedItem) => {
      queryClient.setQueryData<SharedList[]>(listsQueryKey, (current) =>
        current?.map((list) =>
          list.id === updatedItem.listId
            ? {
                ...list,
                items: list.items.map((item) =>
                  item.id === updatedItem.id ? updatedItem : item,
                ),
              }
            : list,
        ),
      );
    },
  });

  const addItem = () => {
    const title = newItemTitle.trim();
    if (!activeList || !title || createItemMutation.isPending) return;
    createItemMutation.mutate({ listId: activeList.id, title });
  };

  if (isPending) {
    return (
      <View className="items-center py-20">
        <ActivityIndicator colorClassName="accent-primary" size="large" />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="items-center px-7 py-16">
        <Text className="text-center font-serif text-[18px] text-foreground">We couldn&apos;t load your lists.</Text>
        <Pressable className="mt-5 rounded-full bg-primary px-5 py-3 active:opacity-80" onPress={() => void refetch()}>
          <Text className="text-[14px] font-semibold text-primary-foreground">Try again</Text>
        </Pressable>
      </View>
    );
  }

  const completedCount = activeList?.items.filter((item) => item.completed).length ?? 0;

  return (
    <>
      <View className="mt-6 flex-row items-center">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1" contentContainerClassName="gap-5 pr-4">
          {lists.map((list) => {
            const active = list.id === activeList?.id;
            return (
              <Pressable key={list.id} onPress={() => setActiveListId(list.id)}>
                <Text className={cn("font-serif text-[19px]", active ? "font-bold text-foreground" : "text-accent")}>
                  {list.name}
                </Text>
                {active ? <View className="mt-1.5 h-0.5 bg-primary" /> : null}
              </Pressable>
            );
          })}
        </ScrollView>
        <Pressable
          accessibilityLabel="Create a new list"
          className="ml-1 h-9 w-9 items-center justify-center rounded-full border border-border-subtle active:bg-secondary"
          onPress={() => setIsCreateListOpen(true)}
        >
          <ThemedIcon icon={Plus} tone="primary" size={19} strokeWidth={2} />
        </Pressable>
      </View>

      {activeList ? (
        <>
          <Text className="mt-5 text-[13px] text-muted-foreground">
            {activeList.items.length} ideas · {completedCount} done
          </Text>
          <View className="mt-3">
            {activeList.items.map((item, index) => (
              <Pressable
                key={item.id}
                className={cn("flex-row items-center gap-4 py-4", index ? "border-t border-border-subtle" : "")}
                disabled={updateItemMutation.isPending}
                onPress={() => updateItemMutation.mutate({ itemId: item.id, completed: !item.completed })}
              >
                <View className={cn("h-8 w-8 items-center justify-center rounded-full border", item.completed ? "border-primary bg-primary" : "border-foreground/30")}>
                  {item.completed ? <ThemedIcon icon={Check} tone="primaryForeground" size={16} strokeWidth={2.4} /> : null}
                </View>
                <Text className={cn("flex-1 text-[18px]", item.completed ? "font-serif italic text-foreground" : "text-foreground")}>
                  {item.title}
                </Text>
              </Pressable>
            ))}
          </View>
          <View className="mt-4 flex-row items-center rounded-full bg-secondary/60 py-1.5 pl-5 pr-1.5">
            <Input
              className="flex-1 text-[16px] text-foreground"
              editable={!createItemMutation.isPending}
              onChangeText={setNewItemTitle}
              onSubmitEditing={addItem}
              placeholder={`Add to ${activeList.name}…`}
              returnKeyType="done"
              value={newItemTitle}
              variant="plain"
            />
            <Pressable
              accessibilityLabel={`Add item to ${activeList.name}`}
              className="h-11 w-11 items-center justify-center rounded-full bg-primary active:opacity-80 disabled:opacity-50"
              disabled={!newItemTitle.trim() || createItemMutation.isPending}
              onPress={addItem}
            >
              <ThemedIcon icon={ArrowRight} tone="primaryForeground" size={20} strokeWidth={2} />
            </Pressable>
          </View>
        </>
      ) : (
        <View className="items-center px-7 py-16">
          <Text className="text-center font-serif text-[18px] text-foreground">Start a shared list.</Text>
          <Text className="mt-1.5 text-center text-[14px] leading-5 text-muted-foreground">
            Keep ideas, gifts, and small things you want to do together in one place.
          </Text>
          <Pressable className="mt-5 rounded-full bg-primary px-5 py-3 active:opacity-80" onPress={() => setIsCreateListOpen(true)}>
            <Text className="text-[14px] font-semibold text-primary-foreground">Create a list</Text>
          </Pressable>
        </View>
      )}

      <AlertDialog onOpenChange={setIsCreateListOpen} open={isCreateListOpen}>
        <AlertDialogContent className="mx-4 self-stretch rounded-3xl border-border-subtle bg-card p-5 web:mx-0 web:self-center">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-left text-[22px] text-foreground">New shared list</AlertDialogTitle>
            <AlertDialogDescription className="text-left text-[15px] leading-6 text-muted-foreground">
              Give this collection a name, like Date ideas or Gift ideas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            autoFocus
            className="mt-1 text-[16px]"
            editable={!createListMutation.isPending}
            onChangeText={setNewListName}
            onSubmitEditing={() => newListName.trim() && createListMutation.mutate()}
            placeholder="List name"
            returnKeyType="done"
            value={newListName}
          />
          <View className="mt-1 flex-row gap-3">
            <Pressable className="h-12 flex-1 items-center justify-center rounded-2xl border border-border-subtle active:bg-secondary" disabled={createListMutation.isPending} onPress={() => setIsCreateListOpen(false)}>
              <Text className="text-[15px] font-semibold text-foreground">Cancel</Text>
            </Pressable>
            <Pressable className="h-12 flex-1 items-center justify-center rounded-2xl bg-primary active:opacity-80 disabled:opacity-50" disabled={!newListName.trim() || createListMutation.isPending} onPress={() => createListMutation.mutate()}>
              <Text className="text-[15px] font-semibold text-primary-foreground">{createListMutation.isPending ? "Creating..." : "Create list"}</Text>
            </Pressable>
          </View>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export { OurLists };
