const DEMO_INVITE = {
  code: "MR7X49",
  displayCode: "MR · 7X49",
  inviterName: "Meera",
  inviteeName: "Arjun",
} as const;

const DEMO_INVITE_URL = `https://youse.app/invite/${DEMO_INVITE.code}`;

export { DEMO_INVITE, DEMO_INVITE_URL };
