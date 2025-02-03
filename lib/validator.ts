import { z } from "zod";

export const eventFormSchema = z.object({
  title: z.string().min(3, "tilte must be at least three caracteres"),
  description: z
    .string()
    .min(3, "description must be at least three caracteres")
    .max(400, "Description must be max of 400 caracters"),
  location: z
    .string()
    .min(3, "Location must be at least three caracteres")
    .max(400, "Location must be max of 400 caracters"),
  imageUrl: z.string(),
  startDateTime: z.date(),
  endDateTime: z.date(),
  categoryId: z.string(),
  price: z.string(),
  isFree: z.boolean(),
  url: z.string().url(),
});
