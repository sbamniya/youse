import api from "./api";

export type Poke = {
  id: string;
  userPartnerId: string;
  senderId: string;
  recipientId: string;
  type: string;
  createdAt: string;
};

export async function sendPoke(type: string): Promise<Poke> {
  return api.post<Poke, { type: string }>("/pokes", { type });
}
