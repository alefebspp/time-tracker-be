import z from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  password: z.string(),
  companyName: z.string(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});
