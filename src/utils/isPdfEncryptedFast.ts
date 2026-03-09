export async function isPdfEncryptedFast(file: File): Promise<boolean> {
  const startChunk = await file.slice(0, 1024 * 32).text();
  const endChunk = await file.slice(Math.max(0, file.size - 1024 * 32)).text();

  const text = startChunk + endChunk;

  return /\/Encrypt\b/.test(text);
}
