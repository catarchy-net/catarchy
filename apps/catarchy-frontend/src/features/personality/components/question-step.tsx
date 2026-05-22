import { Box, Button, cn, RadioInput, Text } from "@/features/common";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import styles from "./question-step.module.css";

export function QuestionStep({
  question,
  descriptions,
  totalCount,
  currentIndex,
  onAnswer,
}: {
  question: string;
  descriptions: string[];
  totalCount: number;
  currentIndex: number;
  onAnswer: (answer: 1 | 2 | 3 | 4 | 5) => void;
}) {
  const form = useForm({
    defaultValues: {
      answer: null,
    },
    resolver: zodResolver(
      z.object({
        answer: z
          .union([
            z.literal(1),
            z.literal(2),
            z.literal(3),
            z.literal(4),
            z.literal(5),
          ])
          .nullable()
          .refine((value) => value !== null, {
            message: "Please select an answer.",
          }),
      }),
    ),
  });

  const selected = form.watch("answer");

  return (
    <article className={styles.container}>
      <header className={styles.header}>
        <Text as="p" className={styles.progress}>
          Question {currentIndex + 1} of {totalCount}
        </Text>
        <Text as="p" className={cn([styles.question, "font-bold"])}>
          {question}
        </Text>
      </header>

      <form
        onSubmit={form.handleSubmit((formdata) => {
          onAnswer(formdata.answer);
        })}
      >
        <div>
          <div className={styles.selectContainer}>
            <Text>NO</Text>
            <div
              className={styles.radioGroup}
              style={
                {
                  "--answer-gap": "1.75rem",
                } as React.CSSProperties
              }
            >
              <Controller
                name="answer"
                control={form.control}
                render={({ field }) => (
                  <>
                    {([1, 2, 3, 4, 5] as const).map((value) => (
                      <RadioInput
                        key={value}
                        className={styles.radioItem}
                        name={field.name}
                        value={value}
                        checked={field.value === value}
                        onChange={(e) =>
                          field.onChange(Number(e.currentTarget.value))
                        }
                        onBlur={field.onBlur}
                      />
                    ))}
                  </>
                )}
              />
            </div>
            <Text>YES</Text>
          </div>
        </div>

        <div className={styles.description}>
          <Box rounded containerClassName={styles.descriptionContainer}>
            <Text as="p" className={styles.descriptionText}>
              {!selected ? (
                <Text className="italic">
                  Select an answer to see the description.
                </Text>
              ) : (
                descriptions[selected - 1]
              )}
            </Text>
          </Box>
        </div>

        <div className={styles.action}>
          <Button disabled={!form.formState.isValid}>Submit</Button>
        </div>
      </form>
    </article>
  );
}
