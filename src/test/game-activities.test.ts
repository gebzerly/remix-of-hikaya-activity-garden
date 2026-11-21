import { describe, expect, it } from "vitest";

import {
  activities,
  countFirstAttemptCorrect,
  countRetriedActivities,
  createActivityResult,
  isCorrectAnswer,
} from "@/lib/game-activities";

describe("فكّر وقارن activities and scoring", () => {
  it("contains exactly 15 activities in three levels of five", () => {
    expect(activities).toHaveLength(15);
    expect([1, 2, 3].map((level) => activities.filter((item) => item.level === level).length)).toEqual([
      5, 5, 5,
    ]);
  });

  it("scores every stated correct answer, including physical left and right", () => {
    expect(activities.map((activity) => isCorrectAnswer(activity, activity.answer))).toEqual(
      Array(15).fill(true),
    );
    expect(activities.slice(10).map((activity) => activity.answer)).toEqual([
      "left",
      "right",
      "left",
      "left",
      "left",
    ]);
  });

  it("does not mark a wrong choice as correct", () => {
    const firstActivity = activities.find((activity) => activity.id === 1);
    const eleventhActivity = activities.find((activity) => activity.id === 11);
    if (!firstActivity || !eleventhActivity) throw new Error("Expected activities 1 and 11 to exist");

    expect(isCorrectAnswer(firstActivity, "الشكل")).toBe(false);
    expect(isCorrectAnswer(eleventhActivity, "right")).toBe(false);
  });

  it("counts independent first answers and retries separately", () => {
    const results = [
      { id: 1, firstAttemptCorrect: true, attempts: 1 },
      { id: 2, firstAttemptCorrect: false, attempts: 2 },
      { id: 3, firstAttemptCorrect: false, attempts: 3 },
    ];
    expect(countFirstAttemptCorrect(results)).toBe(1);
    expect(countRetriedActivities(results)).toBe(2);
  });

  it("awards first-attempt credit only for a correct first response", () => {
    const activity = activities.find((item) => item.id === 1);
    if (!activity) throw new Error("Expected activity 1 to exist");

    expect(createActivityResult(activity, "اللون", 1)).toEqual({
      id: 1,
      attempts: 1,
      firstAttemptCorrect: true,
    });
    expect(createActivityResult(activity, "اللون", 2)).toEqual({
      id: 1,
      attempts: 2,
      firstAttemptCorrect: false,
    });
  });

  it("awards no first-attempt credit when a right answer follows a retry", () => {
    const activity = activities.find((item) => item.id === 1);
    if (!activity) throw new Error("Expected activity 1 to exist");

    const result = createActivityResult(activity, "اللون", 2);
    expect(result?.firstAttemptCorrect).toBe(false);
    expect(result?.attempts).toBe(2);
  });

  it("does not complete an activity for a wrong choice or invalid attempt", () => {
    const activity = activities.find((item) => item.id === 1);
    if (!activity) throw new Error("Expected activity 1 to exist");

    expect(createActivityResult(activity, "الشكل", 1)).toBeNull();
    expect(createActivityResult(activity, "اللون", 0)).toBeNull();
  });

  it("keeps level-three answers aligned with the physical left and right sides", () => {
    expect(activities.filter((item) => item.level === 3).map((item) => item.answer)).toEqual([
      "left",
      "right",
      "left",
      "left",
      "left",
    ]);
  });
});