import z from "zod";

export const createSchema = z.object({
  type: z.enum(["start", "end"]),
  createdAt: z.coerce.date(),
});

export const findAllSchema = z.object({
  userId: z.string().optional(),
  type: z.enum(["start", "end"]).optional(),
  limit: z.coerce.number().optional(),
  offset: z.coerce.number().optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});
