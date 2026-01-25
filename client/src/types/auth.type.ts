import { registerSchema, loginSchema } from "@/schema/auth.schema";
import { z } from "zod";

export interface JwtTokenPayload {
  sub: string;
  email: string;
  role: 'host' | 'user' | 'admin';
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  iat?: number;
  exp?: number;
}

export type LoginPayload = z.infer<typeof loginSchema>;
export type RegisterPayload = z.infer<typeof registerSchema>;