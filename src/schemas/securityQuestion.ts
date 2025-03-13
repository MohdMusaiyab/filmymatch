import { z } from "zod";

// Define the SecurityQuestion enum in Zod
export const SecurityQuestionSchema = z.enum([
  "MOTHERS_MAIDEN_NAME",
  "FIRST_PET_NAME",
  "BIRTH_CITY",
  "FAVORITE_TEACHER",
  "CHILDHOOD_NICKNAME",
  "FIRST_CAR_MODEL",
  "HIGH_SCHOOL_MASCOT",
]);

// Export the inferred type for the enum
export type SecurityQuestion = z.infer<typeof SecurityQuestionSchema>;