import { Redirect, useLocalSearchParams } from "expo-router";

import {
  isCompleteInvitationCode,
  normalizeInvitationCode,
} from "@/lib/invite";

export default function InviteLink() {
  const { code } = useLocalSearchParams<{ code?: string }>();
  const normalizedCode = normalizeInvitationCode(code ?? "");

  if (!isCompleteInvitationCode(normalizedCode)) {
    return <Redirect href="/invite-code" />;
  }

  return (
    <Redirect
      href={{
        pathname: "/invite-welcome",
        params: { code: normalizedCode },
      }}
    />
  );
}
