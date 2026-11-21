// PostgreSQL text and JSONB reject NUL and isolated UTF-16 surrogates.
// Unicode mode keeps valid surrogate pairs (including emojis) intact.
export function toDatabaseText(value: string): string {
  return value.replace(/\u0000/g, '').replace(/[\uD800-\uDFFF]/gu, '\uFFFD');
}

export function cleanGameText(value: string, maxLength: number): string {
  const text = toDatabaseText(value).trim().slice(0, maxLength);
  // A UTF-16 length limit can leave the first half of a valid pair at the end.
  return text.replace(/[\uD800-\uDBFF]$/, '');
}
