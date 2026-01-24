import { registerSchema, loginSchema } from "../schema/auth.schema";
import { z } from "zod";
export interface JwtTokenPayload {
  sub: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

export type RegisterPayload = z.infer<typeof registerSchema>;
export type LoginPayload = z.infer<typeof loginSchema>;