/**
 * OpenAI text embeddings — thin fetch wrapper, no SDK dependency.
 *
 * Used to embed recipe descriptions (and future RAG corpora) for pgvector
 * similarity search. Model is fixed at text-embedding-3-small (1536 dims) to
 * match the `vector(1536)` columns declared in the schema — changing models
 * means a new column/migration, not just swapping this constant.
 */

const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = 1536;
const OPENAI_EMBEDDINGS_URL = "https://api.openai.com/v1/embeddings";

interface OpenAIEmbeddingsResponse {
  data: Array<{ embedding: number[]; index: number }>;
}

async function callEmbeddingsApi(input: string[]): Promise<number[][]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const response = await fetch(OPENAI_EMBEDDINGS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model: EMBEDDING_MODEL, input }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `OpenAI embeddings request failed (${response.status}): ${body.slice(0, 300)}`,
    );
  }

  const json = (await response.json()) as OpenAIEmbeddingsResponse;
  // The API returns items in arbitrary order; `index` maps back to the input array.
  const vectors = new Array<number[]>(input.length);
  for (const item of json.data) {
    vectors[item.index] = item.embedding;
  }
  return vectors;
}

/** Embed a single string. For many strings, prefer embedTexts (one request). */
export async function embedText(text: string): Promise<number[]> {
  const [vector] = await embedTexts([text]);
  return vector;
}

/** Embed multiple strings in one OpenAI request. */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  return callEmbeddingsApi(texts);
}

/** Format a JS number array as a pgvector literal for parameterized queries. */
export function toPgVectorLiteral(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}

export { EMBEDDING_DIMENSIONS, EMBEDDING_MODEL };
