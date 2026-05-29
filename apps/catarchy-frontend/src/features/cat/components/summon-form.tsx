import { CatSex } from "@catarchy/shared/constants/cat";

import { Box, Field, RadioInput, Text, TextInput } from "@/features/common";

import { useSummonFormContext } from "../hooks/use-adopt-form";
import styles from "./summon-form.module.css";

export function SummonForm() {
  const form = useSummonFormContext();

  return (
    <form className={styles.form}>
      <Field
        label="Cat's name"
        required
        error={form.formState.errors.name?.message}
      >
        <TextInput {...form.register("name")} />
      </Field>
      <Field label="Sex" required error={form.formState.errors.sex?.message}>
        <div className={styles.radioGroup}>
          <Box
            as="label"
            htmlFor="sex-male"
            containerClassName={styles.radioBox}
            rounded
          >
            <RadioInput
              {...form.register("sex")}
              id="sex-male"
              value={CatSex.MALE}
            />
            <Text className={styles.radioLabel}>♂ MALE</Text>
          </Box>
          <Box
            as="label"
            htmlFor="sex-female"
            containerClassName={styles.radioBox}
            rounded
          >
            <RadioInput
              {...form.register("sex")}
              id="sex-female"
              value={CatSex.FEMALE}
            />
            <Text className={styles.radioLabel}>♀ FEMALE</Text>
          </Box>
        </div>
      </Field>
    </form>
  );
}
