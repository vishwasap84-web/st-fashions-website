import "express-session";

declare module "express-session" {
  interface SessionData {
    customer?: {
      id: string;
      name: string;
      phone: string;
    };
    admin?: {
      username: string;
    };
  }
}