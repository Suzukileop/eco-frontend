export type TextCaseMode = 'sentence' | 'lower' | 'upper' | 'title';

export function applySentenceCase(text: string): string {
  if (!text) return text;
  const lead = text.match(/^\s*/)?.[0] ?? '';
  const trimmed = text.trimStart();
  if (!trimmed) return text;
  return lead + trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

export function applyTitleCase(text: string): string {
  return text
    .toLowerCase()
    .replace(/(?:^|\s|[-–—])\w/g, (m) => m.toUpperCase());
}

export function applyTextCaseMode(text: string, mode: TextCaseMode): string {
  if (!text) return text;
  switch (mode) {
    case 'lower':
      return text.toLowerCase();
    case 'upper':
      return text.toUpperCase();
    case 'title':
      return applyTitleCase(text);
    case 'sentence':
      return applySentenceCase(text);
    default:
      return text;
  }
}

export const TEXT_CASE_OPTIONS: { mode: TextCaseMode; label: string }[] = [
  { mode: 'sentence', label: 'Casse de la phrase' },
  { mode: 'lower', label: 'Minuscule' },
  { mode: 'upper', label: 'Majuscule' },
  { mode: 'title', label: 'Casse du titre' },
];
