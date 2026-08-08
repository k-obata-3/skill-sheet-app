export const CATEGORY_LABEL: Record<Category, string> = {
  languages: "言語",
  frameworks: "フレームワーク",
  databases: "データベース",
  cloud: "クラウド・インフラ",
  tools: "ツール",
};

export const PHASE_LABEL: Record<Phase, string> = {
  requirement: "要件定義",
  basicDesign: "基本設計",
  detailDesign: "詳細設計",
  implement: "実装",
  test: "テスト",
  operation: "運用・保守",
};

export type Category =
  | "languages"
  | "frameworks"
  | "databases"
  | "cloud"
  | "tools";

export type Phase =
  | "requirement"
  | "basicDesign"
  | "detailDesign"
  | "implement"
  | "test"
  | "operation";

export type ProjectJsonKey = "description" | "role" | "phases";

export type ProjectJson = {
  description: string,
  role: string,
  phases: string[],
};

export type ProjectFormData = {
  id?: string;
  name: string;
  periodFrom: string;
  periodTo: string | null;
  projectJson: ProjectJson;
  skillsJson: Record<Category, string[]>;
};

