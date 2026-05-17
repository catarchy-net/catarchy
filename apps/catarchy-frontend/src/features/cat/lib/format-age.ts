const SUPERSCRIPT = ["⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹"];
const SUBSCRIPT = ["₀", "₁", "₂", "₃", "₄", "₅", "₆", "₇", "₈", "₉"];

const toSuper = (n: number) =>
  String(n)
    .split("")
    .map((d) => SUPERSCRIPT[+d])
    .join("");

const toSub = (n: number) =>
  String(n)
    .split("")
    .map((d) => SUBSCRIPT[+d])
    .join("");

export function formatAge(
  age: { int: number; fraction: { numerator: number; denominator: number } },
  ageGroup?: string,
): string {
  const { int, fraction } = age;
  if (fraction.numerator === 0) return `${int}`;
  const frac = `${toSuper(fraction.numerator)}⁄${toSub(fraction.denominator)}`;
  const base = `${int ? int + " " : ""}${frac}`;
  return ageGroup ? `${base} (${ageGroup})` : base;
}
