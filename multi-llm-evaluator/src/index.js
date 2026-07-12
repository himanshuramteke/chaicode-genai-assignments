import "dotenv/config";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import chalk from "chalk";
import { candidateModels } from "./models.js";
import { askModel } from "./askModel.js";
import { evaluateAnswers } from "./evaluate.js";

const rl = readline.createInterface({ input, output });

function printBanner() {
  const title = "MULTI-LLM ANSWER EVALUATOR";
  const width = title.length + 8;
  const pad = (width - title.length) / 2;

  console.log(chalk.cyan.bold("╔" + "═".repeat(width) + "╗"));
  console.log(
    chalk.cyan.bold(
      "║" +
        " ".repeat(Math.floor(pad)) +
        title +
        " ".repeat(Math.ceil(pad)) +
        "║",
    ),
  );
  console.log(chalk.cyan.bold("╚" + "═".repeat(width) + "╝"));
  console.log(
    chalk.gray("\nAsk a question and get answers from multiple AI models."),
  );
  console.log(chalk.gray("Type `exit` or `quit` to close the application.\n"));

  const legend = candidateModels.map((m) => `${m.provider}`).join(" | ");
  console.log(chalk.gray(`Models: ${legend}\n`));
}

async function runApp() {
  console.clear();
  printBanner();

  while (true) {
    const prompt = (await rl.question(chalk.yellow("You: "))).trim();

    if (!prompt) {
      console.log(chalk.red("Please enter a question.\n"));
      continue;
    }

    if (prompt.toLowerCase() === "exit" || prompt.toLowerCase() === "quit") {
      console.log(chalk.cyan("\nGoodbye!\n"));
      rl.close();
      process.exit(0);
    }

    console.log("\n" + chalk.yellow.bold("━━ GENERATING RESPONSES ━━"));
    console.log(
      chalk.gray("OpenAI = Green | Anthropic = Magenta | Gemini = Blue\n"),
    );

    const startedAt = Date.now();

    const results = await Promise.all(
      candidateModels.map((modelConfig) =>
        askModel({
          provider: modelConfig.provider,
          model: modelConfig.model,
          prompt,
        }),
      ),
    );

    const successfulCount = results.filter(
      (result) => result.answer && !result.error,
    ).length;

    if (successfulCount === 0) {
      console.log(chalk.red("\nNo model response was completed. Try again.\n"));
      continue;
    }

    console.log(
      "\n" +
        chalk.yellow.bold(
          `━━ ${successfulCount}/${candidateModels.length} RESPONSES RECEIVED — SYNTHESIZING FINAL ANSWER ━━`,
        ) +
        "\n",
    );

    try {
      await evaluateAnswers(prompt, results);
    } catch (error) {
      console.log(
        chalk.red(
          error instanceof Error
            ? error.message
            : "Unable to generate the final answer.",
        ),
      );
    }

    const totalSeconds = ((Date.now() - startedAt) / 1000).toFixed(1);
    console.log(chalk.gray(`Total time: ${totalSeconds}s`));
    console.log(chalk.gray("\n" + "─".repeat(60) + "\n"));
  }
}

rl.on("SIGINT", () => {
  console.log(chalk.cyan("\n\nGoodbye!\n"));
  rl.close();
  process.exit(0);
});

runApp();
