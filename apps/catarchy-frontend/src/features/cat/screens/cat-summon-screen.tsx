import { Button, LogoText, Scaffold, useToast } from "@/features/common";
import { catListOptions } from "../services/cat-info";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { FormProvider } from "react-hook-form";
import z from "zod";
import { SummonForm } from "../components/summon-form";
import { summonFormSchema, useSummonForm } from "../hooks/use-adopt-form";
import { summonOptions } from "../services/summon";
import styles from "./cat-summon-screen.module.css";

export function CatSummonScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { form } = useSummonForm();

  const summon = useMutation({
    ...summonOptions(),
    onError(error) {
      // Error case : Conflict (e.g. name already taken)
      if (error.status === 409) {
        form.setError("name", {
          message: error.value.message,
        });
      }
    },
  });

  const submit = async (formData: z.infer<typeof summonFormSchema>) => {
    const result = await summon.mutateAsync(formData);

    if (!result) return;

    toast.push(`Your cat ${result.name} summoned successfully!`, {
      id: "summon-success",
    });

    await queryClient.invalidateQueries(catListOptions());

    await router.navigate({
      to: "/$catId/play",
      params: { catId: result.id },
    });
  };

  return (
    <FormProvider {...form}>
      <Scaffold className="bg-pattern-cat">
        <Scaffold.Header title={<LogoText />} className={styles.header} />
        <Scaffold.Body className={styles.body}>
          <SummonForm />
        </Scaffold.Body>
        <Scaffold.Bottom sticky>
          <Button
            className={styles.bottom}
            size="big"
            disabled={form.formState.isSubmitting || !form.formState.isValid}
            onClick={form.handleSubmit(submit)}
          >
            Summon Cat
          </Button>
        </Scaffold.Bottom>
      </Scaffold>
    </FormProvider>
  );
}
