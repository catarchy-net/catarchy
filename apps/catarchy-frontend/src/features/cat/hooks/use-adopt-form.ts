import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFormContext } from "react-hook-form";
import z from "zod";

export enum CatSex {
  MALE = "MALE",
  FEMALE = "FEMALE",
}

export const summonFormSchema = z.object({
  name: z
    .string()
    .transform((str) => str.normalize("NFC").trim())
    .pipe(
      z
        .string()
        .min(1, "Name is required")
        .max(50, "Name must be at most 50 characters"),
    ),
  sex: z
    .enum(CatSex, { message: "Sex is required" })
    .nullable()
    .refine((val): val is CatSex => val !== null, {
      message: "Sex is required",
    }),
});

export type SummonFormValues = z.infer<typeof summonFormSchema>;

export function useSummonForm() {
  const form = useForm({
    defaultValues: {
      name: "",
      sex: null as CatSex | null,
    },
    resolver: zodResolver(summonFormSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  return {
    form,
  };
}

export const useSummonFormContext = useFormContext<
  z.infer<typeof summonFormSchema>
>;
