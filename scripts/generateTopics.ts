/**
 * scripts/generateTopics.ts
 *
 * 개념 증명(PoC) 수준의 주제 생성 파이프라인입니다.
 * - LLM에 배치로 주제 생성을 요청
 * - 간단 검증(스키마/길이/언어) 수행
 * - 임베딩 기반 의미 중복 제거(그리디 방식)
 * - 최종 결과를 writingTopics.generated.json으로 저장
 *
 * 실제 사용 전에는 OpenAI 클라이언트 설정, 금칙어 목록, 임베딩 모델과 임계값을 조정하세요.
 */

import fs from "fs";
import path from "path";
import OpenAI from "openai"; // 교체 가능: 사용중인 LLM 클라이언트
import type { WritingTopic } from "../writingTopics";

const OUT_FILE = path.resolve(process.cwd(), "writingTopics.generated.json");
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateBatch(count = 20): Promise<WritingTopic[]> {
  const system = `당신은 한국어 글쓰기 주제를 생성하는 어시스턴트입니다. 출력은 JSON 배열로만 반환하세요.`;
  const user = `한국어 글쓰기 주제 ${count}개를 JSON 배열로 생성해 주세요. 각 항목은 { "category": string, "topic": string } 형태입니다.`;

  const resp = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    temperature: 0.4,
    max_tokens: 1500,
  });

  const text = resp.choices?.[0]?.message?.content ?? "";
  try {
    const parsed = JSON.parse(text) as WritingTopic[];
    return parsed;
  } catch (err) {
    console.error("응답 파싱 실패:", err);
    return [];
  }
}

function validate(items: WritingTopic[]): WritingTopic[] {
  const min = 5;
  const max = 120;
  return items.filter(
    (i) =>
      i &&
      typeof i.category === "string" &&
      typeof i.topic === "string" &&
      i.topic.length >= min &&
      i.topic.length <= max,
  );
}

async function embedTexts(texts: string[]): Promise<number[][]> {
  // 임베딩 모델 호출 예시. 실제 사용중인 클라이언트 메서드에 맞게 수정하세요.
  const resp = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: texts,
  });
  return resp.data.map((d) => d.embedding as number[]);
}

function cosine(a: number[], b: number[]) {
  let dot = 0,
    na = 0,
    nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

async function dedupeByEmbedding(
  items: WritingTopic[],
  threshold = 0.85,
): Promise<WritingTopic[]> {
  const texts = items.map((i) => i.topic);
  const embs = await embedTexts(texts);

  const kept: WritingTopic[] = [];
  const keptEmbs: number[][] = [];

  for (let i = 0; i < items.length; i++) {
    const e = embs[i];
    let maxSim = 0;
    for (const ke of keptEmbs) {
      const s = cosine(e, ke);
      if (s > maxSim) maxSim = s;
    }
    if (maxSim < threshold) {
      kept.push(items[i]);
      keptEmbs.push(e);
    }
  }

  return kept;
}

async function main() {
  const all: WritingTopic[] = [];

  // 예시: 20회 반복, 각 회차 20개 생성 = 초안 400개
  for (let i = 0; i < 20; i++) {
    const batch = await generateBatch(20);
    const good = validate(batch);
    console.log(
      `batch ${i + 1}: generated=${batch.length} validated=${good.length}`,
    );
    all.push(...good);
  }

  // 문자 수준 중복 제거 (간단)
  const uniqueByText = Array.from(
    new Map(all.map((t) => [t.topic.trim(), t])).values(),
  );

  // 의미 중복 제거
  const deduped = await dedupeByEmbedding(uniqueByText, 0.85);

  const final = deduped.slice(0, 365);
  fs.writeFileSync(OUT_FILE, JSON.stringify(final, null, 2), "utf8");
  console.log(`written ${final.length} topics -> ${OUT_FILE}`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
