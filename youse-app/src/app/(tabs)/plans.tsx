import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { router } from "expo-router";
import { Plus, RefreshCw } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";

import { AppScreen } from "@/components/app/app-screen";
import { PlansCalendar } from "@/components/app/plans-calendar";
import { OurLists } from "@/components/app/plans-lists";
import { ThemedIcon } from "@/components/app/themed-icon";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Text } from "@/components/ui/text";
import {
  type ApiPlan,
  deletePlan,
  plansQueryKey,
  plansQueryOptions,
} from "@/lib/plans-api";
import { cn } from "@/lib/utils";

export default function Plans() {
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [visibleMonth, setVisibleMonth] = useState(() =>
    dayjs().startOf("month"),
  );
  const [selectedDay, setSelectedDay] = useState(() => dayjs());
  const [planToDelete, setPlanToDelete] = useState<ApiPlan | null>(null);
  const queryClient = useQueryClient();
  const {
    data: plans = [],
    isError,
    isPending,
    isRefetching,
    refetch,
  } = useQuery(plansQueryOptions(visibleMonth));
  const deletePlanMutation = useMutation({
    mutationFn: deletePlan,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: plansQueryKey });
      setPlanToDelete(null);
    },
    onError: () => {
      Alert.alert(
        "Couldn't delete plan",
        "Check your connection and try again.",
      );
    },
  });

  const isCalendar = view === "calendar";
  const openPlanEditor = (plan: ApiPlan) =>
    router.push({ pathname: "/create-plan", params: { id: plan.id } });
  const openPlanCreator = (date = selectedDay) =>
    router.push({
      pathname: "/create-plan",
      params: { date: date.startOf("day").toISOString() },
    });

  return (
    <AppScreen>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-8 pt-3"
        refreshControl={
          <RefreshControl
            onRefresh={() => void refetch()}
            refreshing={isRefetching}
            tintColorClassName="accent-primary"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-start justify-between">
          <View>
            <Text className="text-[28px] font-bold leading-10.75 text-foreground">
              Plans
            </Text>
            <Text
              className="mt-2 text-[10px] font-semibold text-muted-foreground"
              style={{ letterSpacing: 2 }}
            >
              SAME PEOPLE{"\n"}BRIGHTER DAYS
            </Text>
            <View className="mt-2 h-px w-6 bg-muted-foreground" />
          </View>
          {isCalendar && (
            <Pressable
              accessibilityLabel="Add a plan"
              className="h-9 w-9 items-center justify-center"
              onPress={() => openPlanCreator()}
            >
              <ThemedIcon icon={Plus} size={26} strokeWidth={1.8} />
            </Pressable>
          )}
        </View>

        {/* Segmented control */}
        <View className="mt-6 flex-row rounded-full border border-border-subtle p-1">
          {(["calendar", "list"] as const).map((tab) => (
            <Pressable
              key={tab}
              className={cn(
                "flex-1 items-center rounded-full py-3",
                view === tab && "bg-primary",
              )}
              onPress={() => setView(tab)}
            >
              <Text
                className={cn(
                  "text-[15px] font-semibold capitalize",
                  view === tab ? "text-primary-foreground" : "text-foreground",
                )}
              >
                {tab === "calendar" ? "Plans" : "Lists"}
              </Text>
            </Pressable>
          ))}
        </View>

        {isCalendar ? (
          isPending ? (
            <View className="items-center py-20">
              <ActivityIndicator colorClassName="accent-primary" size="large" />
            </View>
          ) : isError ? (
            <View className="items-center px-7 py-16">
              <Text className="text-center font-serif text-[18px] text-foreground">
                We couldn&apos;t load your plans.
              </Text>
              <Pressable
                accessibilityLabel="Retry loading plans"
                className="mt-5 flex-row items-center gap-2 rounded-full bg-primary px-5 py-3 active:opacity-80"
                onPress={() => void refetch()}
              >
                <ThemedIcon
                  icon={RefreshCw}
                  tone="primaryForeground"
                  size={17}
                  strokeWidth={2}
                />
                <Text className="text-[14px] font-semibold text-primary-foreground">
                  Try again
                </Text>
              </Pressable>
            </View>
          ) : (
            <PlansCalendar
              deletingPlanId={deletePlanMutation.variables}
              onDeletePlan={setPlanToDelete}
              onEditPlan={openPlanEditor}
              onAddPlan={openPlanCreator}
              onMonthChange={setVisibleMonth}
              onSelectedDayChange={setSelectedDay}
              plans={plans}
              selectedDay={selectedDay}
              visibleMonth={visibleMonth}
            />
          )
        ) : (
          <OurLists />
        )}
      </ScrollView>

      <AlertDialog
        onOpenChange={(open) => {
          if (!open && !deletePlanMutation.isPending) setPlanToDelete(null);
        }}
        open={planToDelete !== null}
      >
        <AlertDialogContent className="mx-4 self-stretch rounded-3xl border-border-subtle bg-card p-5 web:mx-0 web:self-center">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-left text-[22px] text-foreground">
              Delete this plan?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left text-[15px] leading-6 text-muted-foreground">
              This removes it from both of your shared calendars.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <View className="mt-1 flex-row gap-3">
            <Pressable
              className="h-12 flex-1 items-center justify-center rounded-2xl border border-border-subtle active:bg-secondary"
              disabled={deletePlanMutation.isPending}
              onPress={() => setPlanToDelete(null)}
            >
              <Text className="text-[15px] font-semibold text-foreground">
                Keep plan
              </Text>
            </Pressable>
            <Pressable
              className="h-12 flex-1 items-center justify-center rounded-2xl bg-destructive active:opacity-80 disabled:opacity-50"
              disabled={deletePlanMutation.isPending || !planToDelete}
              onPress={() =>
                planToDelete && deletePlanMutation.mutate(planToDelete.id)
              }
            >
              <Text className="text-[15px] font-semibold text-white">
                {deletePlanMutation.isPending ? "Deleting..." : "Delete plan"}
              </Text>
            </Pressable>
          </View>
        </AlertDialogContent>
      </AlertDialog>
    </AppScreen>
  );
}
