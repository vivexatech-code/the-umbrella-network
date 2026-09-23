import { z } from "zod";

export const CA_LEVELS = [
  "CA Inter - Both Groups Cleared",
  "CA Inter - Group 1 Cleared",
  "CA Inter - Group 2 Cleared",
  "CA Inter - Appearing / Results Awaited",
  "Direct Entry Scheme Student",
  "Searching for Articleship Transfer",
] as const;

const phoneSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/[^\d]/g, ""))
  .transform((digits) => {
    if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
    if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
    return digits;
  })
  .refine((digits) => /^[6-9]\d{9}$/.test(digits), "Enter a valid 10-digit WhatsApp number.");

export const registrationSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Please enter your full name.")
    .max(80, "Name is too long.")
    .transform((value) => value.replace(/[<>]/g, "")),
  email: z.string().trim().email("Please enter a valid email address.").max(160).transform((value) => value.toLowerCase()),
  phone: phoneSchema,
  caLevel: z
    .string()
    .refine((value): value is (typeof CA_LEVELS)[number] => (CA_LEVELS as readonly string[]).includes(value), {
      message: "Select your CA qualification level.",
    }),
  attemptDetails: z
    .string()
    .trim()
    .max(240)
    .optional()
    .transform((value) => (value ? value.replace(/[<>]/g, "") : "")),
  batchId: z.string().trim().min(1, "Please select a masterclass batch.").max(80),
  company: z.string().optional(),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;

export function parseRegistration(body: unknown) {
  const parsed = registrationSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message || "Please check the registration form.";
    return { success: false as const, error: message };
  }
  if (parsed.data.company) {
    return { success: false as const, error: "Registration could not be completed." };
  }
  return { success: true as const, data: parsed.data };
}
