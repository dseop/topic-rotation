# topic-engine

간단한 글쓰기 주제 모음과 유틸리티를 제공하는 TypeScript 라이브러리입니다. 랜덤 주제 선택, 카테고리별 선택, 날짜 기반(결정적) 주제 선택 기능을 제공합니다.

## 설치

```bash
npm i @dding-oss/topic-engine
```

## 빠른 시작

CommonJS

```js
const {
  getRandomWritingTopic,
  getAllCategories,
} = require("@dding-oss/topic-engine");

console.log(getRandomWritingTopic());
// { category: '여행', topic: '가보고 싶은 여행지' }

console.log(getAllCategories());
// ['일상','장소','고민', ...]
```

ESM / TypeScript

```ts
import {
  getTodaysTopic,
  getRandomTopicByCategory,
  getTopicsCount,
  type WritingTopic,
} from "@dding-oss/topic-engine";

const today: WritingTopic = getTodaysTopic(new Date("2025-08-15"));
const travel = getRandomTopicByCategory("여행");
console.log(getTopicsCount());
```

## API

- `getRandomWritingTopic(): WritingTopic` — 전체에서 랜덤 반환
- `getRandomTopicByCategory(category: string): WritingTopic` — 카테고리에서 랜덤, 없으면 전체에서 랜덤으로 폴백(경고 로그)
- `getTopicByIndex(index: number): WritingTopic` — 인덱스 기반 반환(범위 밖이면 첫 항목)
- `getAllCategories(): string[]` — 중복 제거된 카테고리 목록
- `getTopicsCount(): number` — 전체 주제 개수
- `getTopicsCountByCategory(category: string): number` — 카테고리별 개수
- `getTodaysTopic(date?: Date): WritingTopic` — 날짜(YYYY-MM-DD) 기반 결정적 주제
- `getTopicByDate(date: Date): WritingTopic` — `getTodaysTopic` 별칭

타입

```ts
export type WritingTopic = { category: string; topic: string };
```

## 개발자 참고

- 빌드: `npm run build` → `dist/`에 컴파일 산출물 생성.
- 테스트: 예시용 Jest 테스트가 `__tests__/`에 있습니다. 현재 `npm test`는 no-op입니다. 사용하려면 `jest`, `ts-jest`를 설정하고 `"test": "jest"`로 갱신하세요.

## 데이터 및 생성 방식

- 이 라이브러리는 글쓰기 초보자도 쉽게 도전할 수 있는 주제를 포함하고 있습니다. 각 주제는 짧고 즉시 글을 시작할 수 있도록 설계되어 있습니다.
- 주제 데이터는 `writingTopics.json` 파일에 저장되어 있으며, 대량 생성을 위해 LLM(언어 모델) 프롬프트를 사용해 생성되었습니다. 생성된 데이터는 자동 검증과 중복 제거 과정을 거쳐 저장됩니다.

파일: `writingTopics.json` — 항목 스키마: `{ "category": string, "topic": string }`

## 생성 프롬프트 예시

아래 예시는 LLM에 대량의 주제를 생성하도록 지시할 때 사용할 수 있는 시스템/사용자 프롬프트 템플릿입니다. 서비스별 파라미터(temperature, max_tokens 등)는 필요에 따라 조정하세요.

System (역할):

```
당신은 한국어 글쓰기 주제를 생성하는 어시스턴트입니다. 다음 규칙을 엄격히 따르세요.
1) 출력은 JSON 배열만 반환합니다.
2) 항목 형식은 { "category": "카테고리명", "topic": "주제문장" } 입니다.
3) topic은 한국어로 5~60자 이내여야 합니다.
4) 비속어, 정치/선동/증오 표현 금지.
5) 의미상 중복 최소화 — 단, 문자 수준 중복은 별도 검증에서 제거합니다.
6) 글쓰기 초보자가 짧은 글을 쓰기 쉬운 주제로 작성하세요.
```

User (요청 예시):

```
한국어 글쓰기 주제 20개를 생성해 주세요. 카테고리는 다양하게 분포시키고, 각 topic은 단문 또는 질문 형태로 간결하게 작성하세요. 출력은 순수 JSON 배열만 해주세요.
```

예시(생성 결과 일부):

```json
[ { "category": "일상", "topic": "최근에 나를 웃게 만든 작은 사건" }, ...]

```

## 간단한 파이프라인(스크립트) 샘플

아래는 Node.js(TypeScript) 기준의 간단한 파이프라인 예시입니다. 실제로 사용하려면 OpenAI(또는 선택한 LLM) 클라이언트와 임베딩 모델, 금칙어 목록 등을 설정해야 합니다. 이 스크립트는 개념 증명(proof-of-concept) 수준입니다.

파일 생성 스크립트 샘플은 `scripts/generateTopics.ts`에 포함되어 있습니다 — 해당 스크립트는 LLM로 주제를 배치 생성하고, 간단 검증과 임베딩 기반 중복 제거를 수행해 최종 JSON을 출력합니다.

### 중복 검사 스크립트: `scripts/dedupeSample.ts`

주의: `scripts/dedupeSample.ts`는 더 이상 로컬 mock 임베딩을 사용하지 않고, 외부 임베드 API(POST `/embed`)를 호출합니다.

- 요구사항
  - 외부 임베드 API 엔드포인트가 필요합니다. 요청은 POST `{API_BASE}/embed`에 JSON 바디 `{ "inputs": ["문장1","문장2", ...] }` 형태로 보내야 하며, 응답은 `{ "embeddings": [[...],[...], ...] }` 같은 유사도 행렬을 포함해야 합니다.
  - Node 18+ 권장(전역 `fetch` 사용). Node <18 환경에서는 `node-fetch` 등의 폴리필을 전역에 등록해야 합니다.

- 실행 예시

  ```bash
  EMBED_API_BASE="https://your-embed-host.example" npx tsx packages/topic-engine/scripts/dedupeSample.ts
  # 또는 ts-node 사용
  EMBED_API_BASE="https://your-embed-host.example" npx ts-node packages/topic-engine/scripts/dedupeSample.ts
  ```

- 출력
  - 후보 쌍은 `packages/topic-engine/data/dedupe-candidates.json`에 저장됩니다.
  - 기본 유사도 임계치: `0.88` (스크립트 내부의 `threshold` 값을 조정하여 변경 가능).

- Troubleshooting
  - `ECONNREFUSED` 등 연결 오류가 발생하면 API 서버가 실행 중인지, URL/포트가 올바른지 확인하세요.
  - 응답 형식이 `{ "embeddings" }` 배열이 아니면 스크립트가 실패하거나 후보가 빈 배열로 출력될 수 있습니다.
