import { registerHostSchema, registerUserSchema, loginSchema } from "../schema/auth.schema";
import { z } from "zod";
export interface JwtTokenPayload {
  sub: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

export type RegisterHostPayload = z.infer<typeof registerHostSchema>;
export type RegisterUserPayload = z.infer<typeof registerUserSchema>;
export type LoginPayload = z.infer<typeof loginSchema>;