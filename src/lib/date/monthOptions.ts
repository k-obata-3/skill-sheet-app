export const YEARS = (() => {
  const current = new Date().getFullYear();
  const n = current - 1950;
  return Array.from({ length: n + 1 }, (_, i) => {
    return { value: current - i, label: `${current - i}年` }
  })
})();

export const MONTHS = Array.from({ length: 12 }, (_, i) => {
  const m = i + 1;
  return { value: String(m).padStart(2, "0"), label: `${m}月` };
});

export const DAYS = (year: number, month: number) => {
  if(year && month) {
    const n = new Date(year, month, 0).getDate();
    return Array.from({ length: n }, (_, i) => {
      return { value: String(i + 1).padStart(2, "0"), label: `${i + 1}日` }
    });
  } else {
    return [{ value: "", label: `` }];
  }
}

export function toYYYYMM(year?: number, month?: string) {
  if (!year || !month) return "";
  return `${year}-${month}`;
}

export function toYYYYMMDD(year?: number, month?: string, day?: string) {
  if (!year || !month || !day) return "";
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

export function fromYYYYMM(value?: string) {
  if (!value) return { year: undefined, month: undefined };
  const [y, m] = value.split("-");
  return { year: Number(y), month: m };
}

export function fromYYYYMMDD(value?: string) {
  if (!value) return { year: undefined, month: undefined, day: undefined };
  const [y, m, d] = value.split("-");
  return { year: Number(y), month: m, day: d };
}
