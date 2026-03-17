/**
 * Web Crypto API(SHA-256)를 사용한 단방향 해시 함수.
 * 브라우저와 Node.js(Next.js) 환경 모두에서 동작합니다.
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
