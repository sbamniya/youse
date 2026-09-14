import { router } from "expo-router";
import { Archive, Download, ShieldAlert, Trash2 } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { PageIntro } from "@/components/app/page-intro";
import { PrimaryAction } from "@/components/app/primary-action";
import { SelectionOption } from "@/components/app/selection-option";
import { ThemedIcon } from "@/components/app/themed-icon";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Text } from "@/components/ui/text";
import { currentSpaceQueryKey, currentSpaceQueryOptions, unlinkRelationship } from "@/lib/current-space";
import { currentUserQueryKey, getCurrentUser, usePersistCurrentUser } from "@/lib/current-user";

type DataOption = "export" | "archive" | "delete";

const options = [
  {
    comingSoon: true,
    description: "Download a copy of all shared photos, plans and memories to keep.",
    icon: Download,
    title: "Export everything",
    value: "export",
  },
  {
    comingSoon: true,
    description: "Keep everything, but move it out of your shared space. Only you can see it.",
    icon: Archive,
    title: "Archive privately",
    value: "archive",
  },
  {
    comingSoon: false,
    description: "Permanently delete all shared photos, plans and memories from both of our accounts.",
    icon: Trash2,
    title: "Delete shared data",
    value: "delete",
  },
] as const;

export default function UnlinkPartner() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const persistCurrentUser = usePersistCurrentUser();
  const [selection, setSelection] = useState<DataOption>("delete");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [error, setError] = useState("");
  const { data: currentSpace } = useQuery(currentSpaceQueryOptions);
  const { data: currentUser } = useQuery({
    queryKey: currentUserQueryKey,
    queryFn: getCurrentUser,
  });
  const partnerName = currentSpace?.partner?.name?.trim()
    || currentSpace?.partnerName?.trim()
    || currentUser?.partnerName?.trim()
    || "your partner";
  const mode = selection === "archive" ? "archive" : "delete";
  const unlinkMutation = useMutation({
    mutationFn: () => unlinkRelationship(mode),
    onSuccess: async ({ mode }) => {
      queryClient.removeQueries({ queryKey: currentSpaceQueryKey });
      const user = await getCurrentUser();
      await persistCurrentUser(user);
      setIsConfirmOpen(false);
      router.replace({ pathname: "/unlink-success", params: { mode } });
    },
    onError: () => {
      setError("We couldn't unlink your partner. Check your connection and try again.");
      setIsConfirmOpen(false);
    },
  });

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-11"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingTop: Math.max(insets.top + 18, 42) }}>
          <PageIntro
            className="mt-2"
            eyebrow="RELATIONSHIP SETTINGS"
            description="Choose what happens to your photos, plans and memories."
            title={"What should happen\nto your shared\nspace?"}
            backArrow={{ onPress: () => router.back() }}
          />

          <View className="mt-6 gap-3">
            {options.map(({ comingSoon, description, icon, title, value }) => (
              <SelectionOption
                badge={comingSoon ? "Coming soon" : undefined}
                compact
                key={value}
                description={description}
                disabled={comingSoon}
                icon={icon}
                isSelected={selection === value}
                onPress={() => setSelection(value)}
                title={title}
              />
            ))}
          </View>

          <View className="mt-6 flex-row items-center rounded-[18px] border border-destructive/35 bg-destructive/10 px-4 py-4">
            <View className="h-10 w-10 shrink-0 items-center justify-center rounded-full border border-destructive/70">
              <ThemedIcon icon={ShieldAlert} tone="destructive" size={21} strokeWidth={1.7} />
            </View>
            <View className="ml-4 flex-1 border-l border-destructive/35 pl-4">
              <Text className="text-[16px] font-bold text-destructive">Unlinking is permanent.</Text>
              <Text className="mt-1 font-serif text-[14px] text-primary">{partnerName} will be notified.</Text>
            </View>
          </View>

          <PrimaryAction
            className="mt-6"
            disabled={unlinkMutation.isPending}
            label={`Unlink ${partnerName}`}
            onPress={() => {
              setError("");
              setIsConfirmOpen(true);
            }}
          />
          {error ? <Text className="mt-3 text-center text-sm text-destructive">{error}</Text> : null}
          <Pressable
            accessibilityRole="button"
            className="mt-4 items-center self-center px-2 py-1 active:opacity-65"
            onPress={() => router.back()}
          >
            <Text className="font-serif text-[16px] text-primary">Cancel</Text>
          </Pressable>
        </View>
      </ScrollView>
      <AlertDialog onOpenChange={setIsConfirmOpen} open={isConfirmOpen}>
        <AlertDialogContent className="mx-5 rounded-3xl border-border-subtle bg-card p-6 web:mx-0">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-left text-[22px] text-foreground">
              Unlink {partnerName}?
            </AlertDialogTitle>
            <AlertDialogDescription className="mt-2 text-left text-[16px] leading-6 text-muted-foreground">
              This permanently deletes your shared photos, plans, lists, and memories for both of you.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-2 gap-3">
            <AlertDialogCancel disabled={unlinkMutation.isPending} className="h-12 rounded-full">
              <Text>Cancel</Text>
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={unlinkMutation.isPending}
              className="h-12 rounded-full bg-destructive active:bg-destructive/90"
              onPress={(event) => {
                event.preventDefault();
                unlinkMutation.mutate();
              }}
            >
              <Text>{unlinkMutation.isPending ? "Unlinking…" : "Unlink permanently"}</Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </View>
  );
}
