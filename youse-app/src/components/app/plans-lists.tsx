import dayjs from "dayjs";
import { CalendarDays } from "lucide-react-native";
import { View } from "react-native";

import { ThemedIcon } from "@/components/app/themed-icon";
import { Text } from "@/components/ui/text";
import type { ApiPlan } from "@/lib/plans-api";

import { PlanRow } from "./plans-calendar";

type OurListsProps = {
  plans: ApiPlan[];
  onEditPlan: (plan: ApiPlan) => void;
  onDeletePlan: (plan: ApiPlan) => void;
  deletingPlanId?: string;
};

function OurLists({ plans, onEditPlan, onDeletePlan, deletingPlanId }: OurListsProps) {
  const upcomingPlans = plans.filter((plan) => dayjs(plan.dateTime).isAfter(dayjs().subtract(1, "day")));

  if (!upcomingPlans.length) {
    return (
      <View className="items-center px-7 py-16">
        <ThemedIcon icon={CalendarDays} tone="muted" size={30} strokeWidth={1.4} />
        <Text className="mt-4 text-center font-serif text-[18px] text-foreground">Your plans will live here.</Text>
        <Text className="mt-1.5 text-center text-[14px] leading-5 text-muted-foreground">
          Add a date, trip, or small thing to look forward to together.
        </Text>
      </View>
    );
  }

  return (
    <View className="mt-5">
      <Text className="text-[11px] font-semibold uppercase text-muted-foreground" style={{ letterSpacing: 1.6 }}>
        Upcoming · {upcomingPlans.length}
      </Text>
      <View className="mt-1">
        {upcomingPlans.map((plan, index) => (
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
    </View>
  );
}

export { OurLists };
