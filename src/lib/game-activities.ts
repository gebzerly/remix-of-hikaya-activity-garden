export type Attribute = "اللون" | "الشكل" | "الحجم";
export type Side = "left" | "right";
export type ObjectKind =
  | "car"
  | "hat"
  | "cup"
  | "banana"
  | "coat"
  | "ball"
  | "leaf"
  | "book"
  | "balloon"
  | "circle"
  | "square"
  | "tree"
  | "pencil"
  | "plate"
  | "ribbon"
  | "bag"
  | "apple";
export type ObjectColor = "red" | "blue" | "yellow" | "green" | "orange";

export interface GameObject {
  kind: ObjectKind;
  color: ObjectColor;
  size?: "small" | "large";
  count?: number;
  label: string;
}

export interface Activity {
  id: number;
  level: 1 | 2 | 3;
  question: string;
  left: GameObject;
  right: GameObject;
  answer: Attribute | Side;
}

const object = (
  kind: ObjectKind,
  color: ObjectColor,
  label: string,
  options: Pick<GameObject, "size" | "count"> = {},
): GameObject => ({ kind, color, label, ...options });

export const activities: Activity[] = [
  {
    id: 1,
    level: 1,
    question: "إيه اللي شبه بعض في الصورتين؟",
    left: object("car", "red", "عربية حمرا"),
    right: object("hat", "red", "كاب أحمر"),
    answer: "اللون",
  },
  {
    id: 2,
    level: 1,
    question: "إيه اللي شبه بعض في الصورتين؟",
    left: object("cup", "blue", "كوباية زرقا"),
    right: object("cup", "red", "كوباية حمرا"),
    answer: "الشكل",
  },
  {
    id: 3,
    level: 1,
    question: "إيه اللي شبه بعض في الصورتين؟",
    left: object("banana", "yellow", "موزة صفرا"),
    right: object("coat", "yellow", "جاكيت أصفر"),
    answer: "اللون",
  },
  {
    id: 4,
    level: 1,
    question: "إيه اللي شبه بعض في الصورتين؟",
    left: object("ball", "green", "كورة خضرا"),
    right: object("ball", "orange", "كورة برتقالي"),
    answer: "الشكل",
  },
  {
    id: 5,
    level: 1,
    question: "إيه اللي شبه بعض في الصورتين؟",
    left: object("leaf", "green", "ورقة شجر خضرا"),
    right: object("book", "green", "كتاب أخضر"),
    answer: "اللون",
  },
  {
    id: 6,
    level: 2,
    question: "إيه اللي مختلف بين الصورتين؟",
    left: object("balloon", "blue", "بلونة كبيرة", { size: "large" }),
    right: object("balloon", "blue", "بلونة صغيرة", { size: "small" }),
    answer: "الحجم",
  },
  {
    id: 7,
    level: 2,
    question: "إيه اللي مختلف بين الصورتين؟",
    left: object("cup", "red", "كوباية حمرا"),
    right: object("cup", "blue", "كوباية زرقا"),
    answer: "اللون",
  },
  {
    id: 8,
    level: 2,
    question: "إيه اللي مختلف بين الصورتين؟",
    left: object("circle", "blue", "دايرة زرقا"),
    right: object("square", "blue", "مربع أزرق"),
    answer: "الشكل",
  },
  {
    id: 9,
    level: 2,
    question: "إيه اللي مختلف بين الصورتين؟",
    left: object("car", "yellow", "عربية صفرا"),
    right: object("car", "green", "عربية خضرا"),
    answer: "اللون",
  },
  {
    id: 10,
    level: 2,
    question: "إيه اللي مختلف بين الصورتين؟",
    left: object("tree", "green", "شجرة كبيرة", { size: "large" }),
    right: object("tree", "green", "شجرة صغيرة", { size: "small" }),
    answer: "الحجم",
  },
  {
    id: 11,
    level: 3,
    question: "أنهي قلم أطول؟",
    left: object("pencil", "blue", "القلم الطويل"),
    right: object("pencil", "blue", "القلم القصير", { size: "small" }),
    answer: "left",
  },
  {
    id: 12,
    level: 3,
    question: "أنهي طبق فيه أكتر؟",
    left: object("plate", "orange", "طبق فيه بسكوتتين", { count: 2 }),
    right: object("plate", "orange", "طبق فيه أربع بسكوتات", { count: 4 }),
    answer: "right",
  },
  {
    id: 13,
    level: 3,
    question: "أنهي شريط أعرض؟",
    left: object("ribbon", "red", "الشريط العريض", { size: "large" }),
    right: object("ribbon", "red", "الشريط الرفيع", { size: "small" }),
    answer: "left",
  },
  {
    id: 14,
    level: 3,
    question: "أنهي شنطة أصغر؟",
    left: object("bag", "green", "الشنطة الصغيرة", { size: "small" }),
    right: object("bag", "green", "الشنطة الكبيرة", { size: "large" }),
    answer: "left",
  },
  {
    id: 15,
    level: 3,
    question: "أنهي تفاحة أكبر؟",
    left: object("apple", "red", "التفاحة الكبيرة", { size: "large" }),
    right: object("apple", "red", "التفاحة الصغيرة", { size: "small" }),
    answer: "left",
  },
];

export const levelTitles: Record<Activity["level"], string> = {
  1: "أوجه التشابه",
  2: "أوجه الاختلاف",
  3: "قارن واختار",
};

export interface ActivityResult {
  id: number;
  firstAttemptCorrect: boolean;
  attempts: number;
}

export function isCorrectAnswer(activity: Activity, answer: string): boolean {
  return activity.answer === answer;
}

export function createActivityResult(
  activity: Activity,
  answer: string,
  attempts: number,
): ActivityResult | null {
  if (!isCorrectAnswer(activity, answer) || !Number.isInteger(attempts) || attempts < 1) return null;
  return { id: activity.id, attempts, firstAttemptCorrect: attempts === 1 };
}

export function countFirstAttemptCorrect(results: ActivityResult[]): number {
  return results.filter((result) => result.firstAttemptCorrect).length;
}

export function countRetriedActivities(results: ActivityResult[]): number {
  return results.filter((result) => result.attempts > 1).length;
}