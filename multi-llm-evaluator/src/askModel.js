import chalk from "chalk";
import { client } from "./client.js";

function getProviderStyle(provider) {
  const styles = {
    OpenAI: {
      title: chalk.green.bold,
      text: chalk.green,
      status: chalk.greenBright,
    },
    Anthropic: {
      title: chalk.magenta.bold,
      text: chalk.magenta,
      status: chalk.magentaBright,
    },
    Gemini: {
      title: chalk.blue.bold,
      text: chalk.blue,
      status: chalk.blueBright,
    },
  };

  return (
    styles[provider] ?? {
      title: chalk.white.bold,
      text: chalk.white,
      status: chalk.gray,
    }
  );
}

export async function askModel({ provider, model, prompt }) {
  const startedAt = Date.now();
  const style = getProviderStyle(provider);
  let answer = "";

  console.log("\n" + style.title(`━━ ${provider} (${model}) ━━`));
  console.log(style.status("Generating response...\n"));

  try {
    const stream = await client.chat.completions.create({
      model,
      stream: true,
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content:
            "Answer accurately, shortly, concisely, and clearly. If unsure, state uncertainty instead of inventing facts.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    for await (const chunk of stream) {
      const content = chunk.choices?.[0]?.delta?.content ?? "";

      if (content) {
        answer += content;
        process.stdout.write(style.text(content));
      }
    }

    const durationMs = Date.now() - startedAt;
    console.log(style.status(`\n\n✓ Completed in ${durationMs}ms`));

    return { provider, model, answer, durationMs };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const durationMs = Date.now() - startedAt;

    console.log(style.status(`\n✗ ${provider} failed: ${message}`));

    return { provider, model, answer: "", error: message, durationMs };
  }
}
