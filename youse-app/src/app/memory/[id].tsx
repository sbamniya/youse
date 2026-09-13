import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Ellipsis,
  ImageIcon,
  ImagePlus,
  Pencil,
  Trash2,
  UserRound,
  X,
} from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Pressable,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCSSVariable } from "uniwind";

import { AppScreen } from "@/components/app/app-screen";
import { BackButton } from "@/components/app/back-button";
import { PrimaryAction } from "@/components/app/primary-action";
import { ThemedIcon } from "@/components/app/themed-icon";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { getImageUrl } from "@/lib/image-url";
import {
  type ApiMemory,
  type MemoryItem,
  deleteMemory,
  deleteMemoryItem,
  formatMemoryDate,
  getMemoryImageUrl,
  memoriesQueryKey,
  memoryQueryKey,
  memoryQueryOptions,
  updateMemoryItemCaption,
} from "@/lib/memory-api";

const HERO_HEIGHT = 460;

export default function MemoryDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [scrollY] = useState(() => new Animated.Value(0));
  const [isMemoryDeleteDialogOpen, setIsMemoryDeleteDialogOpen] =
    useState(false);
  const {
    data: memory,
    isError,
    isPending,
    refetch,
  } = useQuery({
    ...memoryQueryOptions(id ?? ""),
    enabled: Boolean(id),
  });
  const deleteMemoryMutation = useMutation({
    mutationFn: () => deleteMemory(id),
    onSuccess: () => {
      queryClient.setQueryData<ApiMemory[]>(memoriesQueryKey, (current) =>
        current?.filter((item) => item.id !== id),
      );
      queryClient.removeQueries({ queryKey: memoryQueryKey(id) });
      router.replace("/memories");
    },
    onError: () => {
      Alert.alert(
        "Couldn't delete memory",
        "Check your connection and try again.",
      );
    },
  });
  const foreground = useCSSVariable("--color-foreground") as string;
  const collapsedHeaderHeight = Math.max(insets.top + 56, 76);
  const collapseDistance = HERO_HEIGHT - collapsedHeaderHeight;
  const heroHeight = scrollY.interpolate({
    inputRange: [0, collapseDistance],
    outputRange: [HERO_HEIGHT, collapsedHeaderHeight],
    extrapolate: "clamp",
  });
  const heroTranslateY = scrollY.interpolate({
    inputRange: [0, collapseDistance],
    outputRange: [0, -96],
    extrapolate: "clamp",
  });
  const heroScale = scrollY.interpolate({
    inputRange: [0, collapseDistance],
    outputRange: [1, 1.08],
    extrapolate: "clamp",
  });
  const compactHeaderOpacity = scrollY.interpolate({
    inputRange: [collapseDistance * 0.55, collapseDistance],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const compactTitleOpacity = scrollY.interpolate({
    inputRange: [collapseDistance * 0.7, collapseDistance],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const controlCircleOpacity = scrollY.interpolate({
    inputRange: [collapseDistance * 0.45, collapseDistance],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  if (id && isPending) {
    return (
      <AppScreen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator colorClassName="accent-primary" size="large" />
        </View>
      </AppScreen>
    );
  }

  if (!id || isError || !memory) {
    return (
      <AppScreen>
        <View className="flex-row px-4 pt-2">
          <BackButton onPress={() => router.replace("/memories")} />
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center font-serif text-[18px] text-muted-foreground">
            We couldn&apos;t load this memory.
          </Text>
          <PrimaryAction
            className="mt-7 w-full"
            label="Try again"
            onPress={() => void refetch()}
          />
        </View>
      </AppScreen>
    );
  }

  const heroImageUrl = getMemoryImageUrl(memory);
  const creatorName = memory.creator?.name?.trim() || "Someone special";
  const creatorImageUrl = getImageUrl(memory.creator?.profilePicture);
  const memoryDetails = [
    formatMemoryDate(memory.memoryDate, "D MMMM YYYY"),
    memory.location?.trim(),
  ]
    .filter(Boolean)
    .join(" · ");

  const editMemory = () =>
    router.push({ pathname: "/create-memory", params: { id: memory.id } });

  const returnToMemories = () => {
    router.replace("/memories");
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="light" />
      <Animated.ScrollView
        className="flex-1"
        contentContainerClassName="bg-background"
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View className="w-full overflow-hidden" style={{ height: heroHeight }}>
          <Animated.View
            className="h-[460px] w-full"
            style={{ transform: [{ translateY: heroTranslateY }, { scale: heroScale }] }}
          >
            {heroImageUrl ? (
              <Image
                accessibilityLabel={`${memory.title} memory photo`}
                className="h-full w-full"
                resizeMode="cover"
                source={{ uri: heroImageUrl }}
              />
            ) : (
              <View className="h-full w-full items-center justify-center bg-card">
                <ThemedIcon
                  icon={ImageIcon}
                  tone="muted"
                  size={48}
                  strokeWidth={1.3}
                />
              </View>
            )}
          </Animated.View>
        </Animated.View>
        <View
          className="px-8 pt-9"
          style={{ paddingBottom: Math.max(insets.bottom + 34, 54) }}
        >
          <Text
            className="text-[11px] font-medium uppercase text-primary"
            style={{ letterSpacing: 3.2 }}
          >
            {memoryDetails}
          </Text>

          <Text className="mt-3.5 text-[50px] font-bold leading-[54px] text-foreground">
            {memory.title}
          </Text>

          <Text className="mt-3 font-serif text-[23px] leading-[30px] text-primary/90">
            {memory.description?.trim() || "A moment worth keeping."}
          </Text>

          <View className="mt-9 flex-row items-center justify-between">
            <View className="flex-row items-center gap-4">
              {creatorImageUrl ? (
                <Image
                  accessibilityLabel={`${creatorName}'s profile photo`}
                  className="h-[58px] w-[58px] rounded-full border border-primary/80"
                  resizeMode="cover"
                  source={{ uri: creatorImageUrl }}
                />
              ) : (
                <View className="h-[58px] w-[58px] items-center justify-center rounded-full border border-primary/80 bg-card">
                  <ThemedIcon
                    icon={UserRound}
                    tone="muted"
                    size={25}
                    strokeWidth={1.5}
                  />
                </View>
              )}
              <View>
                <Text
                  className="text-[10px] font-medium uppercase text-primary"
                  style={{ letterSpacing: 2.4 }}
                >
                  Added by
                </Text>
                <Text className="mt-0.5 font-serif text-[22px] text-foreground">
                  {creatorName}
                </Text>
              </View>
            </View>
          </View>

          <Gallery memory={memory} />
        </View>
      </Animated.ScrollView>

      <View
        className="absolute inset-x-0 top-0 z-10"
        pointerEvents="box-none"
        style={{ height: collapsedHeaderHeight }}
      >
        <Animated.View
          className="absolute inset-0 bg-background"
          pointerEvents="none"
          style={{ opacity: compactHeaderOpacity }}
        />
        <View
          className="flex-row items-center justify-between px-5"
          pointerEvents="box-none"
          style={{ paddingTop: Math.max(insets.top + 8, 24) }}
        >
          <BackButton onPress={returnToMemories} />

          <Animated.Text
            numberOfLines={1}
            style={{ color: foreground, fontSize: 18, fontWeight: "700", opacity: compactTitleOpacity }}
          >
            {memory.title}
          </Animated.Text>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Pressable
                accessibilityLabel="More memory options"
                className="h-10 w-10 items-center justify-center disabled:opacity-50"
                disabled={deleteMemoryMutation.isPending}
                hitSlop={8}
              >
                <Animated.View
                  className="absolute inset-0 rounded-full bg-black/45"
                  style={{ opacity: controlCircleOpacity }}
                />
                <ThemedIcon
                  icon={Ellipsis}
                  tone="foreground"
                  size={26}
                  strokeWidth={2.4}
                />
              </Pressable>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="bottom" sideOffset={8}>
              <DropdownMenuItem accessibilityLabel="Edit memory" onPress={editMemory}>
                <ThemedIcon
                  icon={Pencil}
                  tone="primary"
                  size={17}
                  strokeWidth={1.9}
                />
                <Text className="text-[15px] font-medium text-foreground">
                  Edit memory
                </Text>
              </DropdownMenuItem>
              <DropdownMenuItem
                accessibilityLabel="Delete memory"
                variant="destructive"
                onPress={() => setIsMemoryDeleteDialogOpen(true)}
              >
                <ThemedIcon
                  icon={X}
                  tone="destructive"
                  size={18}
                  strokeWidth={2}
                />
                <Text className="text-[15px] font-medium text-destructive">
                  Delete memory
                </Text>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </View>
      </View>

      <AlertDialog
        onOpenChange={setIsMemoryDeleteDialogOpen}
        open={isMemoryDeleteDialogOpen}
      >
        <AlertDialogContent className="mx-4 self-stretch rounded-3xl border-border-subtle bg-card p-5 web:mx-0 web:self-center">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-left text-[22px] text-foreground">
              Delete this memory?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left text-[15px] leading-6 text-muted-foreground">
              This removes the memory and its gallery from your shared space.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <View className="mt-1 flex-row gap-3">
            <Pressable
              accessibilityLabel="Keep memory"
              className="h-12 flex-1 items-center justify-center rounded-2xl border border-border-subtle active:bg-secondary"
              onPress={() => setIsMemoryDeleteDialogOpen(false)}
            >
              <Text className="text-[15px] font-semibold text-foreground">
                Keep memory
              </Text>
            </Pressable>
            <Pressable
              accessibilityLabel="Delete memory"
              className="h-12 flex-1 items-center justify-center rounded-2xl bg-destructive active:opacity-80 disabled:opacity-50"
              disabled={deleteMemoryMutation.isPending}
              onPress={() => {
                setIsMemoryDeleteDialogOpen(false);
                deleteMemoryMutation.mutate();
              }}
            >
              <Text className="text-[15px] font-semibold text-white">
                Delete memory
              </Text>
            </Pressable>
          </View>
        </AlertDialogContent>
      </AlertDialog>
    </View>
  );
}

function Gallery({ memory }: { memory: ApiMemory }) {
  const queryClient = useQueryClient();
  const [photoToEdit, setPhotoToEdit] = useState<MemoryItem | null>(null);
  const [captionDraft, setCaptionDraft] = useState("");
  const [captionError, setCaptionError] = useState("");
  const [photoToDelete, setPhotoToDelete] = useState<MemoryItem | null>(null);
  const updateMemoryCaches = (update: (current: ApiMemory) => ApiMemory) => {
    queryClient.setQueryData<ApiMemory>(memoryQueryKey(memory.id), (current) =>
      current ? update(current) : current,
    );
    queryClient.setQueryData<ApiMemory[]>(memoriesQueryKey, (current) =>
      current?.map((item) => (item.id === memory.id ? update(item) : item)),
    );
  };
  const captionMutation = useMutation({
    mutationFn: ({ itemId, caption }: { itemId: string; caption: string | null }) =>
      updateMemoryItemCaption(memory.id, itemId, caption),
    onSuccess: (updatedPhoto) => {
      updateMemoryCaches((current) => ({
        ...current,
        partnerMemoryItems: current.partnerMemoryItems.map((photo) =>
          photo.id === updatedPhoto.id ? updatedPhoto : photo,
        ),
      }));
      setPhotoToEdit(null);
      setCaptionDraft("");
      setCaptionError("");
    },
    onError: () => {
      setCaptionError(
        "We couldn't save this caption. Check your connection and try again.",
      );
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (photo: MemoryItem) =>
      deleteMemoryItem(memory.id, photo.id).then(() => photo),
    onSuccess: (deletedPhoto) => {
      updateMemoryCaches((current) => {
        const remainingPhotos = current.partnerMemoryItems.filter(
          (photo) => photo.id !== deletedPhoto.id,
        );

        return { ...current, partnerMemoryItems: remainingPhotos };
      });
      if (photoToEdit?.id === deletedPhoto.id) {
        setPhotoToEdit(null);
        setCaptionDraft("");
        setCaptionError("");
      }
    },
    onError: () => {
      Alert.alert(
        "Couldn't delete photo",
        "Check your connection and try again.",
      );
    },
  });

  const beginEditingCaption = (photo: MemoryItem) => {
    setPhotoToEdit(photo);
    setCaptionDraft(photo.caption ?? "");
    setCaptionError("");
  };

  return (
    <View className="mt-9">
      <Text
        className="text-[10px] font-medium uppercase text-primary"
        style={{ letterSpacing: 2.4 }}
      >
        Gallery · {memory.partnerMemoryItems.length}{" "}
        {memory.partnerMemoryItems.length === 1 ? "photo" : "photos"}
      </Text>
      <View className="-mx-1.5 mt-3 flex-row flex-wrap">
        <View className="w-1/2 p-1.5">
          <Pressable
            accessibilityLabel={`Add a photo to ${memory.title}`}
            className="aspect-[3/4] w-full items-center justify-center rounded-2xl border border-dashed border-border bg-card px-4 active:opacity-70"
            onPress={() => router.push(`/memory/${memory.id}/add-photo`)}
          >
            <View className="h-11 w-11 items-center justify-center rounded-full bg-secondary">
              <ThemedIcon icon={ImagePlus} size={22} strokeWidth={1.8} />
            </View>
            <Text className="mt-3 text-center text-[14px] font-semibold text-primary">Add photo</Text>
            <Text className="mt-1 text-center text-[11px] text-muted-foreground">Caption optional</Text>
          </Pressable>
        </View>
        {memory.partnerMemoryItems.map((photo) => {
          const imageUrl = getImageUrl(photo.imageUrl);
          const isDeleting =
            deleteMutation.isPending && deleteMutation.variables?.id === photo.id;

          return (
            <View key={photo.id} className="w-1/2 p-1.5">
              <View className="overflow-hidden rounded-2xl bg-card">
                <View className="relative aspect-[3/4] w-full overflow-hidden">
                  {imageUrl ? (
                    <Image
                      accessibilityLabel={`${memory.title} gallery photo`}
                      className="h-full w-full"
                      resizeMode="cover"
                      source={{ uri: imageUrl }}
                    />
                  ) : (
                    <View className="h-full w-full items-center justify-center">
                      <ThemedIcon
                        icon={ImageIcon}
                        tone="muted"
                        size={26}
                        strokeWidth={1.5}
                      />
                    </View>
                  )}
                  {photo.caption ? (
                    <View
                      className="absolute inset-x-0 bottom-0 bg-black/60 px-3 pb-3 pt-7"
                      pointerEvents="none"
                    >
                      <Text
                        className="font-serif text-[13px] leading-5 text-white"
                        numberOfLines={3}
                      >
                        {photo.caption}
                      </Text>
                    </View>
                  ) : null}
                  <View className="absolute right-2 top-2 z-10">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Pressable
                          accessibilityLabel={`Options for ${photo.caption || "memory photo"}`}
                          className="h-6 w-6 items-center justify-center rounded-full bg-black/55 active:bg-black/70 disabled:opacity-60"
                          disabled={isDeleting}
                          hitSlop={6}
                        >
                          {isDeleting ? (
                            <ActivityIndicator
                              colorClassName="accent-white"
                              size="small"
                            />
                          ) : (
                            <Ellipsis color="#fff" size={16} strokeWidth={2.4} />
                          )}
                        </Pressable>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" side="bottom">
                        <DropdownMenuItem
                          accessibilityLabel={
                            photo.caption ? "Edit caption" : "Add caption"
                          }
                          onPress={() => beginEditingCaption(photo)}
                        >
                          <ThemedIcon
                            icon={Pencil}
                            tone="primary"
                            size={14}
                            strokeWidth={1.9}
                          />
                          <Text className="text-[12px] font-medium text-foreground">
                            {photo.caption ? "Edit caption" : "Add caption"}
                          </Text>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          accessibilityLabel="Delete photo"
                          variant="destructive"
                          onPress={() => setPhotoToDelete(photo)}
                        >
                          <ThemedIcon
                            icon={Trash2}
                            tone="destructive"
                            size={14}
                            strokeWidth={2}
                          />
                          <Text className="text-[12px] font-medium text-destructive">
                            Delete
                          </Text>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </View>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      <AlertDialog
        onOpenChange={(open) => {
          if (!open && !captionMutation.isPending) {
            setPhotoToEdit(null);
            setCaptionDraft("");
            setCaptionError("");
          }
        }}
        open={photoToEdit !== null}
      >
        <AlertDialogContent className="mx-4 self-stretch rounded-3xl border-border-subtle bg-card p-5 web:mx-0 web:self-center">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-left text-[22px] text-foreground">
              {photoToEdit?.caption ? "Edit caption" : "Add a caption"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left text-[15px] leading-6 text-muted-foreground">
              Your caption will appear at the bottom of this photo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            accessibilityLabel="Photo caption"
            autoFocus
            className="mt-1 min-h-28 rounded-2xl px-3 py-3 text-[15px] leading-5"
            editable={!captionMutation.isPending}
            maxLength={2000}
            multiline
            onChangeText={(caption) => {
              setCaptionDraft(caption);
              setCaptionError("");
            }}
            placeholder="Add a caption"
            textAlignVertical="top"
            value={captionDraft}
          />
          {captionError ? (
            <Text className="text-[13px] leading-5 text-destructive">
              {captionError}
            </Text>
          ) : null}
          <View className="mt-1 flex-row gap-3">
            <Pressable
              accessibilityLabel="Cancel caption editing"
              className="h-12 flex-1 items-center justify-center rounded-2xl border border-border-subtle active:bg-secondary disabled:opacity-50"
              disabled={captionMutation.isPending}
              onPress={() => {
                setPhotoToEdit(null);
                setCaptionDraft("");
                setCaptionError("");
              }}
            >
              <Text className="text-[15px] font-semibold text-foreground">
                Cancel
              </Text>
            </Pressable>
            <Pressable
              accessibilityLabel="Save photo caption"
              className="h-12 flex-1 items-center justify-center rounded-2xl bg-primary active:opacity-80 disabled:opacity-50"
              disabled={captionMutation.isPending || !photoToEdit}
              onPress={() => {
                if (!photoToEdit) return;
                captionMutation.mutate({
                  itemId: photoToEdit.id,
                  caption: captionDraft.trim() || null,
                });
              }}
            >
              <Text className="text-[15px] font-semibold text-primary-foreground">
                {captionMutation.isPending ? "Saving..." : "Save"}
              </Text>
            </Pressable>
          </View>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        onOpenChange={(open) => {
          if (!open) {
            setPhotoToDelete(null);
          }
        }}
        open={photoToDelete !== null}
      >
        <AlertDialogContent className="mx-4 self-stretch rounded-3xl border-border-subtle bg-card p-5 web:mx-0 web:self-center">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-left text-[22px] text-foreground">
              Delete this photo?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left text-[15px] leading-6 text-muted-foreground">
              This removes the photo from your shared memory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <View className="mt-1 flex-row gap-3">
            <Pressable
              accessibilityLabel="Keep photo"
              className="h-12 flex-1 items-center justify-center rounded-2xl border border-border-subtle active:bg-secondary"
              onPress={() => setPhotoToDelete(null)}
            >
              <Text className="text-[15px] font-semibold text-foreground">
                Keep photo
              </Text>
            </Pressable>
            <Pressable
              accessibilityLabel="Delete photo"
              className="h-12 flex-1 items-center justify-center rounded-2xl bg-destructive active:opacity-80 disabled:opacity-50"
              disabled={deleteMutation.isPending || !photoToDelete}
              onPress={() => {
                if (!photoToDelete) return;
                deleteMutation.mutate(photoToDelete);
                setPhotoToDelete(null);
              }}
            >
              <Text className="text-[15px] font-semibold text-white">
                Delete photo
              </Text>
            </Pressable>
          </View>
        </AlertDialogContent>
      </AlertDialog>
    </View>
  );
}
