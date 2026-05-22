import { cn, HeaderBackButton, Scaffold, Text } from "@/features/common";

import styles from "./test-introduction-screen.module.css";

export function TestIntroductionScreen() {
  return (
    <Scaffold>
      <Scaffold.Header
        title="About the Personality Test"
        left={<HeaderBackButton />}
      />
      <Scaffold.Body className={styles.body}>
        <article className={styles.article}>
          <Text as="h2" className={cn(styles.title, "font-bold")}>
            Purpose of This Test
          </Text>
          <Text as="p" className={styles.paragraph}>
            This test aims to analyze your personality to determine your cat's
            personality. Your personality will influence your cat's behavior,
            preferences, friendships with other cats, romance, and marriage.
          </Text>
        </article>

        <article className={styles.article}>
          <Text as="h2" className={cn(styles.title, "font-bold")}>
            The BIG FIVE Personality Traits
          </Text>
          <Text as="p" className={styles.paragraph}>
            This test consists of 50 questions designed to measure the Big Five
            personality traits, analyzing your personality type based on your
            answers. There are five personality traits in total, defined as
            follows:
          </Text>
          <dl className={styles.definitionList}>
            <div>
              <dt className={styles.definitionTerm}>Openness</dt>
              <dd className={styles.definitionDescription}>
                Open individuals are creative, curious, and enjoy new
                experiences.
              </dd>
            </div>

            <div>
              <dt className={styles.definitionTerm}>Conscientiousness</dt>
              <dd className={styles.definitionDescription}>
                Conscientious individuals are organized, highly responsible, and
                strive to achieve their goals.
              </dd>
            </div>

            <div>
              <dt className={styles.definitionTerm}>Extraversion</dt>
              <dd className={styles.definitionDescription}>
                Extraverted individuals are sociable, active, and enjoy
                interacting with others.
              </dd>
            </div>

            <div>
              <dt className={styles.definitionTerm}>Agreeableness</dt>
              <dd className={styles.definitionDescription}>
                Agreeable individuals are kind, cooperative, and empathetic
                toward others' feelings.
              </dd>
            </div>

            <div>
              <dt className={styles.definitionTerm}>Neuroticism</dt>
              <dd className={styles.definitionDescription}>
                Individuals high in neuroticism are emotionally unstable and can
                be sensitive to stress.
              </dd>
            </div>
          </dl>
        </article>

        <article className={styles.article}>
          <Text as="h2" className={cn(styles.title, "font-bold")}>
            Test Structure
          </Text>
          <Text as="p" className={styles.paragraph}>
            For each test question, you will rate how well it aligns with your
            usual behavior or thoughts using a 5-point scale ranging from
            "Strongly Disagree" to "Strongly Agree." For example, given a
            statement like "I enjoy new experiences," if you do enjoy them, you
            can choose an answer closer to "Strongly Agree." On the other hand,
            if you do not, you can choose an answer closer to "Strongly
            Disagree." However, you do not necessarily have to choose answers
            that perfectly match your actual personality. You can select answers
            based on how you perceive yourself or how you wish to be seen.
          </Text>
          <Text as="p" className={styles.paragraph}>
            To assist you with your choices, descriptions for each response
            option are provided throughout this test. Please note that once
            submitted, each answer is immediately applied to your cat's
            personality scores and cannot be changed.
          </Text>
        </article>

        <article className={styles.article}>
          <Text as="h2" className={cn(styles.title, "font-bold")}>
            Reliability
          </Text>
          <Text as="p" className={styles.paragraph}>
            This test is based on the Big Five personality traits, which are
            widely used in psychological research. While a standard Big Five
            personality test typically consists of 120 questions, Catarchy uses
            the 50-item scale from{" "}
            <cite className={styles.citation}>
              Goldberg, L. R. "The development of markers for the Big-Five
              factor structure" (1992)
            </cite>{" "}
            for a quicker assessment. For more details, please refer to the{" "}
            <a
              className={styles.link}
              href="https://ipip.ori.org/new_ipip-50-item-scale.htm"
              target="_blank"
              rel="noopener noreferrer"
            >
              IPIP 50-item scale (Goldberg's Big-Five markers)
            </a>
            .
          </Text>
          <Text as="p" className={styles.paragraph}>
            Please note, however, that this test is not a professional
            psychological assessment tool and cannot perfectly analyze your
            personality. You may intentionally answer this psychological test
            untruthfully, and your personality can vary depending on the
            situation. Therefore, please use the test results for reference
            purposes only.
          </Text>

          <Text as="p" className={styles.paragraph}>
            Furthermore, the descriptions for each response option are entirely
            fictional and may differ from the descriptions used in actual
            psychological research. These descriptions are designed solely to
            help users understand each option and may not align with real
            psychological concepts.
          </Text>
        </article>

        <article className={styles.article}>
          <Text as="h2" className={cn(styles.title, "font-bold")}>
            Privacy Policy
          </Text>

          <Text as="p" className={styles.paragraph}>
            Your individual responses are never stored. Each answer is
            immediately applied to your cat's personality scores, and only
            those final scores are retained on our servers. The results are
            used solely to determine your cat character's personality type and
            to establish relationships with other cats.
          </Text>

          <Text as="p" className={styles.paragraph}>
            If you have any concerns regarding your privacy, please feel free to
            contact at{" "}
            <a href="mailto:admin@catarchy.net" className={styles.link}>
              admin@catarchy.net
            </a>
            . If you have any technical questions, you may also open an issue on
            the{" "}
            <a
              href="https://github.com/catarchy-net/catarchy/issues"
              className={styles.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              Catarchy GitHub Repository Issue Tracker
            </a>
            .
          </Text>
        </article>
      </Scaffold.Body>
    </Scaffold>
  );
}
