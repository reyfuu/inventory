import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const registerSchema = z.object({
  name: z.string().trim().min(1).max(255),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(200),
  signupCode: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
