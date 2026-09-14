import dayjs, { type Dayjs } from "dayjs";
import {
  CalendarDays,
  Ellipsis,
  MapPin,
  Plane,
  Plus,
  UtensilsCrossed,
} from "lucide-react-native";
import { useMemo } from "react";
import { Image, Pressable, View } from "react-native";

import { Calendar } from "@/components/app/calendar";
import { ThemedIcon } from "@/components/app/themed-icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Text } from "@/components/ui/text";
import { getImageUrl } from "@/lib/image-url";
import type { ApiPlan } from "@/lib/plans-api";
import { cn } from "@/lib/utils";

type PlansCalendarProps = {
  plans: ApiPlan[];
  onEditPlan: (plan: ApiPlan) => void;
  onDeletePlan: (plan: ApiPlan) => void;
  visibleMonth: Dayjs;
  onMonthChange: (month: Dayjs) => void;
  onSelectedDayChange: (day: Dayjs) => void;
  onAddPlan: (day: Dayjs) => void;
  selectedDay: Dayjs;
  deletingPlanId?: string;
};

function getPlanIcon(type: string) {
  switch (type.toLowerCase()) {
    case "trip":
      return Plane;
    case "dinner":
      return UtensilsCrossed;
    default:
      return CalendarDays;
  }
}

function formatPlanDate(plan: ApiPlan) {
  const planDate = dayjs(plan.dateTime);
  if (planDate.isSame(dayjs(), "day")) return `Today, ${planDate.format("h:mm A")}`;
  if (planDate.isSame(dayjs().add(1, "day"), "day")) return `Tomorrow, ${planDate.format("h:mm A")}`;
  return planDate.format("D MMM · h:mm A");
}

function PlanRow({
  plan,
  index,
  onEdit,
  onDelete,
  isDeleting,
}: {
  plan: ApiPlan;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}) {
  const imageUrl = getImageUrl(plan.image);
  const Icon = getPlanIcon(plan.type);

  return (
    <Pressable
      className={cn(
        "flex-row items-center gap-3.5 py-4 active:opacity-70",
        index ? "border-t border-border-subtle" : "",
      )}
      disabled={isDeleting}
      onPress={onEdit}
    >
      <View className="h-15 w-15 overflow-hidden rounded-2xl bg-secondary">
        {imageUrl ? (
          <Image className="h-full w-full" resizeMode="cover" source={{ uri: imageUrl }} />
        ) : (
          <View className="h-full w-full items-center justify-center">
            <ThemedIcon icon={Icon} tone="primary" size={25} strokeWidth={1.6} />
          </View>
        )}
      </View>
      <View className="flex-1">
        <Text className="text-[17px] font-semibold text-foreground">{plan.title}</Text>
        <Text className="mt-0.5 font-serif text-[15px] text-accent">
          {formatPlanDate(plan)}
        </Text>
        <View className="mt-1.5 flex-row items-center gap-1.5">
          <ThemedIcon icon={plan.location ? MapPin : Icon} tone="muted" size={12} strokeWidth={2} />
          <Text className="text-[10px] font-semibold text-muted-foreground" style={{ letterSpacing: 1 }}>
            {(plan.location || plan.type).toUpperCase()}
          </Text>
        </View>
      </View>
      <View className="items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Pressable
              accessibilityLabel={`Options for ${plan.title}`}
              className="h-9 w-9 items-center justify-center rounded-full active:bg-secondary"
              disabled={isDeleting}
              hitSlop={6}
              onPress={(event) => event.stopPropagation()}
            >
              <ThemedIcon icon={Ellipsis} tone="muted" size={20} strokeWidth={2.2} />
            </Pressable>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="bottom">
            <DropdownMenuItem onPress={onEdit}>
              <Text className="text-[14px] font-medium text-foreground">Edit plan</Text>
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onPress={onDelete}>
              <Text className="text-[14px] font-medium text-destructive">Delete plan</Text>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </View>
    </Pressable>
  );
}

function PlansCalendar({ plans, onEditPlan, onDeletePlan, deletingPlanId, visibleMonth, onMonthChange, selectedDay, onSelectedDayChange, onAddPlan }: PlansCalendarProps) {
  const selectedPlans = useMemo(
    () => plans.filter((plan) => dayjs(plan.dateTime).isSame(selectedDay, "day")),
    [plans, selectedDay],
  );

  return (
    <>
      <Calendar
        className="mt-4"
        getMarkerCount={(date) => Math.min(3, plans.filter((plan) => dayjs(plan.dateTime).isSame(date, "day")).length)}
        month={visibleMonth}
        onMonthChange={(month) => {
          onMonthChange(month);
          if (!selectedDay.isSame(month, "month")) onSelectedDayChange(month);
        }}
        onValueChange={onSelectedDayChange}
        value={selectedDay}
      />

      <View className="my-2 h-px bg-border-subtle" />
      <Text className="mt-3 text-[11px] font-semibold uppercase text-muted-foreground" style={{ letterSpacing: 1.6 }}>
        {selectedDay.format("dddd, D MMMM")}
      </Text>

      {selectedPlans.length ? (
        <View className="mt-1">
          {selectedPlans.map((plan, index) => (
            <PlanRow
              key={plan.id}
              index={index}
              isDeleting={deletingPlanId === plan.id}
              onDelete={() => onDeletePlan(plan)}
              onEdit={() => onEditPlan(plan)}
              plan={plan}
            />
          ))}
        </View>
      ) : (
        <View className="items-center px-7 py-12">
          <ThemedIcon icon={CalendarDays} tone="muted" size={30} strokeWidth={1.4} />
          <Text className="mt-4 text-center font-serif text-[18px] text-foreground">Nothing planned yet.</Text>
          <Text className="mt-1.5 text-center text-[14px] leading-5 text-muted-foreground">
            Choose another day or add something to look forward to.
          </Text>
          <Pressable
            accessibilityLabel={`Add a plan on ${selectedDay.format("D MMMM")}`}
            className="mt-5 flex-row items-center gap-2 rounded-full bg-primary px-5 py-3 active:opacity-80"
            onPress={() => onAddPlan(selectedDay)}
          >
            <ThemedIcon icon={Plus} tone="primaryForeground" size={17} strokeWidth={2} />
            <Text className="text-[14px] font-semibold text-primary-foreground">Add a plan</Text>
          </Pressable>
        </View>
      )}
    </>
  );
}

export { PlansCalendar, PlanRow };
export type { PlansCalendarProps };
