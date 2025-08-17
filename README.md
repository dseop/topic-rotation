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
