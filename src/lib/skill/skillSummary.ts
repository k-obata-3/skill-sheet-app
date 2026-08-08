import { Category } from "@/types/project";
import { JsonValue } from "@prisma/client/runtime/library";

export type SkillProjectLike = {
  periodFrom: string;
  periodTo: string | null;
  skillsJson: JsonValue;
  skillSheet: {
      userId: string;
  };
};

export type RankItem = {
  name: string;
  months: number; // 内部用
  label: string;  // 表示用（"2年3ヶ月"）
  coverage: number;       // 0.0〜1.0
  coverageLabel: string;  // "20%"
  contributors?: number;  // 会社全体のみ
  score: number;          // 並び替え用
};

export type RankingResult = {
  byCategory: Record<Category, RankItem[]>;
  totalMonths: number;
};

const CATEGORIES: Category[] = ["languages", "frameworks", "databases", "cloud", "tools"];

function currentParseYm(): { y: number; m: number } {
  const d = new Date();
  return { y: d.getFullYear(), m: d.getMonth() + 1 }; // 1-indexed（parseYm と統一）
}

function parseYm(ym: string): { y: number; m: number } | null {
  const match = ym.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return null;
  }

  const y = Number(match[1]);
  const m = Number(match[2]);
  if (m < 1 || m > 12) {
    return null;
  }

  return { y, m };
}

/**
 * 期間月数（inclusive）
 * 例:
 * 2024-01 → 2024-01 = 1
 * 2024-01 → 2024-12 = 12
 */
function calcMonths(fromYm: string, toYm: string | null): number {
  const from = parseYm(fromYm);
  const to = toYm ? parseYm(toYm) : currentParseYm();
  if (!from || !to) {
    return 0;
  }
  const fromIndex = from.y * 12 + (from.m - 1);
  const toIndex = to.y * 12 + (to.m - 1);

  const diff = toIndex - fromIndex + 1;
  return diff > 0 ? diff : 0;
}

export function monthsToYearMonth(months: number) {
  const y = Math.floor(months / 12);
  const m = Math.round(months % 12);
  return { years: y, months: m };
}

// 表示用文字列
function formatYearMonth(months: number) {
  const y = Math.floor(months / 12);
  const m = Math.round(months % 12);
  if (y === 0) {
    return `${m}ヶ月`;
  }
  if (m === 0) {
    return `${y}年`;
  }

  return `${y}年${m}ヶ月`;
}

function formatPercent(x: number) {
  return `${Math.round(x * 100)}%`;
}

export function buildSkillRanking(projects: SkillProjectLike[], topN = 5) {
  const totalsByCat: Record<Category, Map<string, number>> = {
    languages: new Map(),
    frameworks: new Map(),
    databases: new Map(),
    cloud: new Map(),
    tools: new Map(),
  };

  const contributorsByCat: Record<Category, Map<string, Set<string>>> = {
    languages: new Map(),
    frameworks: new Map(),
    databases: new Map(),
    cloud: new Map(),
    tools: new Map(),
  };

  let totalMonths = 0;

  for (const p of projects) {
    const months = calcMonths(p.periodFrom, p.periodTo);
    if (months <= 0) {
      continue;
    }
    totalMonths += months;

    const skillsJson = p.skillsJson as Record<Category, string[]>;

    for (const cat of CATEGORIES) {
      const skills = (skillsJson?.[cat] ?? []).filter(Boolean);
      if (skills.length === 0) {
        continue;
      }

      const share = months / skills.length;

      for (const s of skills) {
        totalsByCat[cat].set(s, (totalsByCat[cat].get(s) ?? 0) + share);

        // contributors
        const map = contributorsByCat[cat];
        const set = map.get(s) ?? new Set<string>();
        set.add(p.skillSheet?.userId);
        map.set(s, set);
      }
    }
  }

  const byCategory = {} as Record<Category, RankItem[]>;

  for (const cat of CATEGORIES) {
    const totalMonthsByCat = Array.from(totalsByCat[cat].values()).reduce((sum, val) => sum + val, 0);
    const arr = Array.from(totalsByCat[cat].entries())
      .map(([name, months]) => {
        const contributors = contributorsByCat[cat].get(name)?.size ?? 0;
        const coverage = totalMonthsByCat > 0 ? months / totalMonthsByCat : 0;
        const score = coverage * Math.log(1 + contributors); // 正規化

        return {
          name,
          months,
          label: formatYearMonth(months),
          coverage,
          coverageLabel: formatPercent(coverage),
          contributors,
          score,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, topN);

    byCategory[cat] = arr;
  }

  return { byCategory, totalMonths };
}