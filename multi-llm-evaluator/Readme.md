# Multi-LLM Evaluator

A CLI tool that sends your question to multiple LLMs (OpenAI, Anthropic, Gemini) in parallel, streams each answer live, and then uses another LLM to synthesize all of them into one polished final answer.

Repo: [chaicode-genai-assignments/multi-llm-evaluator](https://github.com/himanshuramteke/chaicode-genai-assignments/tree/master/multi-llm-evaluator)

## Setup

```bash
git clone https://github.com/himanshuramteke/chaicode-genai-assignments.git
cd chaicode-genai-assignments/multi-llm-evaluator
npm install
cp .env.example .env   # add your API_KEY
```

## Usage

```bash
npm run dev
```

Type a question, watch each model's answer stream in, then get a synthesized final answer. Type `exit` or `quit` to close.

## Configuration

Edit `src/models.js` to change which models are used:

```js
export const candidateModels = [
  { provider: "OpenAI", model: "openai/gpt-4o-mini" },
  { provider: "Anthropic", model: "anthropic/claude-sonnet-4.5" },
  { provider: "Gemini", model: "google/gemini-2.5-flash" },
];

export const evaluatorModel = "anthropic/claude-sonnet-4.5";
```

## Stack

Node.js · [openai](https://www.npmjs.com/package/openai) SDK (via [MeshAPI](https://meshapi.ai)) · chalk · dotenv
