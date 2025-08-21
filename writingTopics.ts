export type WritingTopic = {
  category: string;
  topic: string;
};

import rawTopics from "./writingTopics.json";
export const WRITING_TOPICS = rawTopics as unknown as WritingTopic[];

/**
 * 랜덤하게 글쓰기 주제를 하나 반환합니다.
 */
export const getRandomWritingTopic = (): WritingTopic => {
  const randomIndex = Math.floor(Math.random() * WRITING_TOPICS.length);
  return WRITING_TOPICS[randomIndex];
};

/**
 * 특정 카테고리의 글쓰기 주제를 랜덤하게 하나 반환합니다.
 * @param category - 원하는 카테고리명
 * @returns 해당 카테고리의 주제, 없으면 전체에서 랜덤 선택
 */
export const getRandomTopicByCategory = (category: string): WritingTopic => {
  const topicsInCategory = WRITING_TOPICS.filter(
    (topic) => topic.category === category,
  );

  if (topicsInCategory.length === 0) {
    console.warn(
      `카테고리 "${category}"에 해당하는 주제가 없습니다. 전체 주제에서 랜덤 선택합니다.`,
    );
    return getRandomWritingTopic();
  }

  const randomIndex = Math.floor(Math.random() * topicsInCategory.length);
  return topicsInCategory[randomIndex];
};

/**
 * 인덱스로 특정 글쓰기 주제를 반환합니다.
 * @param index - 주제의 인덱스 (0부터 시작)
 * @returns 해당 인덱스의 주제, 범위를 벗어나면 첫 번째 주제 반환
 */
export const getTopicByIndex = (index: number): WritingTopic => {
  if (index < 0 || index >= WRITING_TOPICS.length) {
    console.warn(
      `인덱스 ${index}는 유효하지 않습니다. 첫 번째 주제를 반환합니다.`,
    );
    return WRITING_TOPICS[0];
  }

  return WRITING_TOPICS[index];
};

/**
 * 사용 가능한 모든 카테고리 목록을 반환합니다.
 */
export const getAllCategories = (): string[] => {
  const categories = WRITING_TOPICS.map((topic) => topic.category);
  return [...new Set(categories)]; // 중복 제거
};

/**
 * 전체 주제 개수를 반환합니다.
 */
export const getTopicsCount = (): number => {
  return WRITING_TOPICS.length;
};

/**
 * 특정 카테고리의 주제 개수를 반환합니다.
 * @param category - 카테고리명
 */
export const getTopicsCountByCategory = (category: string): number => {
  return WRITING_TOPICS.filter((topic) => topic.category === category).length;
};

/**
 * 오늘 날짜를 기반으로 한 "오늘의 주제"를 반환합니다.
 * 같은 날에는 항상 같은 주제가 반환됩니다.
 * @param date - 기준 날짜 (선택사항, 기본값: 오늘)
 */
export const getTodaysTopic = (date?: Date): WritingTopic => {
  const targetDate = date || new Date();

  // 날짜를 YYYY-MM-DD 형태의 문자열로 변환
  const dateString = targetDate.toISOString().split("T")[0];

  // 날짜 문자열을 기반으로 간단한 해시값 생성
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    const char = dateString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // 32bit 정수로 변환
  }

  // 음수일 수 있으므로 절댓값 사용
  const index = Math.abs(hash) % WRITING_TOPICS.length;

  return WRITING_TOPICS[index];
};

/**
 * 특정 날짜의 주제를 반환합니다. (getTodaysTopic의 별칭)
 * @param date - 기준 날짜
 */
export const getTopicByDate = (date: Date): WritingTopic => {
  return getTodaysTopic(date);
};
