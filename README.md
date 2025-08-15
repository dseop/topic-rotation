# topic-engine

Minimal topic-engine package that exports `writingTopics.ts` utilities.

Usage (CommonJS):

```js
const { getRandomWritingTopic } = require("@dding/topic-engine");
console.log(getRandomWritingTopic());
```

Usage (ESM / TypeScript):

```ts
import { getRandomWritingTopic, getTopicsCount } from "@dding/topic-engine";
console.log(getTopicsCount());
```

API (주요 함수)

- `getRandomWritingTopic(): WritingTopic` — 전체에서 랜덤 반환
- `getRandomTopicByCategory(category: string): WritingTopic` — 카테고리에서 랜덤 반환
- `getTopicByIndex(index: number): WritingTopic` — 인덱스 기반 반환
- `getAllCategories(): string[]` — 사용 가능한 카테고리 목록
- `getTopicsCount(): number` — 전체 주제 개수
- `getTopicsCountByCategory(category: string): number` — 카테고리별 개수
- `getTodaysTopic(date?: Date): WritingTopic` — 날짜 기반 고정 주제
- `getTopicByDate(date: Date): WritingTopic` — `getTodaysTopic`의 별칭

Tests

패키지 내부에 간단한 Jest 테스트가 포함되어 있습니다. 루트에서 `npm test` 또는 `pnpm test`로 전체 테스트를 실행하세요 (루트에 Jest가 설정되어 있어야 합니다).
