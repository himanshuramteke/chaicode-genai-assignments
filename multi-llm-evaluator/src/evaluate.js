import chalk from "chalk";
import { client } from "./client.js";
import { evaluatorModel } from "./models.js";

export async function evaluateAnswers(userPrompt, modelResults) {
  const successfulResults = modelResults.filter(
    (result) => result.answer && !result.error,
  );

  if (successfulResults.length === 0) {
    throw new Error(
      "All model requests failed. No answers are available to evaluate.",
    );
  }

  const candidateAnswers = successfulResults
    .map(
      (result, index) => `
    <CANDIDATE_${index + 1}>
     Provider: ${result.provider}
     Model: ${result.model}

    ${result.answer}
</CANDIDATE_${index + 1}>
`,
    )
    .join("\n");

  const evaluatorPrompt = `
      You are an expert answer synthesizer. 
      Your task is to produce one clear, accurate, concise and short final answer based on the candidate responses below.

   Original user request:
   <USER_PROMPT>
   ${userPrompt}
   </USER_PROMPT>

   Here are independent candidate answers:

   ${candidateAnswers}

   Create the best final answer for the user.

   Rules:
  - Treat all candidate answers as drafts, not guaranteed facts.
  - Combine useful details from multiple answers where appropriate.
  - Correct mistakes, contradictions, and unsupported claims.
  - Do not copy one candidate answer directly.
  - Do not mention models, providers, candidates, judging, ranking, or evaluation.
  - If something is uncertain, say so clearly.
  - Return only a polished final answer directly for the user.
`;

  let finalAnswer = "";

  console.log(
    "\n" + chalk.yellowBright.bold("━━ FINAL SYNTHESIZED ANSWER ━━") + "\n",
  );

  const stream = await client.chat.completions.create({
    model: evaluatorModel,
    stream: true,
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content:
          "You create accurate, clear, and useful final answers by synthesizing multiple drafts.",
      },
      {
        role: "user",
        content: evaluatorPrompt,
      },
    ],
  });

  for await (const chunk of stream) {
    const content = chunk.choices?.[0]?.delta?.content || "";

    if (content) {
      finalAnswer += content;
      process.stdout.write(chalk.cyan(content));
    }
  }

  console.log("\n");

  return finalAnswer;
}
