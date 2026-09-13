import api from "./api";

const INVITATION_CODE_LENGTH = 8;
const VERIFIED_INVITATION_STALE_TIME_MS = 5 * 60 * 1000;

const DEMO_INVITE = {
  code: "MR7X49",
  displayCode: "MR · 7X49",
  inviterName: "Meera",
  inviteeName: "Arjun",
} as const;

const INVITE_BASE_URL = "https://getyouse.app/invite";
const getInviteUrl = (code: string) =>
  `${INVITE_BASE_URL}/${encodeURIComponent(code.trim())}`;
const DEMO_INVITE_URL = getInviteUrl(DEMO_INVITE.code);

type InvitationDetails = {
  relationshipType: string;
  goal: string;
  partnerName: string;
  anniversary: string;
  invitedAt: string;
  inviter: {
    id: string;
    name: string | null;
    profilePicture: string | null;
  };
};

type VerifyInvitationResponse = {
  valid: boolean;
  invitation: InvitationDetails;
};

const normalizeInvitationCode = (code: string) =>
  code.toUpperCase().replace(/[^A-HJ-NP-Z2-9]/g, "");

const isCompleteInvitationCode = (code: string) =>
  normalizeInvitationCode(code).length === INVITATION_CODE_LENGTH;

const invitationQueryKey = (code: string) =>
  ["invitation", "verify", normalizeInvitationCode(code)] as const;

const verifyInvitationCode = async (code: string) => {
  const normalizedCode = normalizeInvitationCode(code);
  const response = await api.get<VerifyInvitationResponse>(
    `/invitation/${encodeURIComponent(normalizedCode)}/verify`,
  );
  if (!response.valid) {
    throw new Error("Invitation is not valid.");
  }
  return response;
};

const acceptInvitationCode = (code: string) =>
  api.post(
    `/invitation/${encodeURIComponent(normalizeInvitationCode(code))}/accept`,
  );

export {
  DEMO_INVITE,
  DEMO_INVITE_URL,
  INVITATION_CODE_LENGTH,
  VERIFIED_INVITATION_STALE_TIME_MS,
  acceptInvitationCode,
  getInviteUrl,
  invitationQueryKey,
  isCompleteInvitationCode,
  normalizeInvitationCode,
  verifyInvitationCode,
};
export type { InvitationDetails, VerifyInvitationResponse };
