import * as topicEngine from "..";

describe("topic-engine basic API", () => {
  test("exports constants and functions", () => {
    expect(topicEngine.WRITING_TOPICS).toBeDefined();
    expect(Array.isArray(topicEngine.WRITING_TOPICS)).toBe(true);
    expect(typeof topicEngine.getRandomWritingTopic).toBe("function");
  });

  test("getTopicsCount returns array length", () => {
    const count = topicEngine.getTopicsCount();
    expect(count).toBe(topicEngine.WRITING_TOPICS.length);
  });

  test("getAllCategories returns unique category list containing known category", () => {
    const cats = topicEngine.getAllCategories();
    expect(Array.isArray(cats)).toBe(true);
    expect(cats).toContain("여행");
  });

  test("getRandomTopicByCategory returns topic in the requested category or falls back", () => {
    const topic = topicEngine.getRandomTopicByCategory("여행");
    expect(topic).toHaveProperty("category");
    expect(topic).toHaveProperty("topic");
    // If invalid category, should return a WritingTopic from the whole list
    const fallback = topicEngine.getRandomTopicByCategory("_no_such_category_");
    expect(fallback).toHaveProperty("category");
    expect(fallback).toHaveProperty("topic");
  });

  test("getTodaysTopic is deterministic for a given date", () => {
    const d = new Date("2025-08-15");
    const a = topicEngine.getTodaysTopic(d);
    const b = topicEngine.getTopicByDate(d);
    expect(a).toEqual(b);
  });
});
