export interface AuthenticatedUser {
  id: string;
  phone: string;
}

declare global {
  namespace Express {
    interface Request {
      rawBody?: Buffer;
      user?: AuthenticatedUser;
    }
  }
}

export {};
