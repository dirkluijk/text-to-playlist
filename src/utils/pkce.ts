import { encodeBase64Url } from "@std/encoding/base64url";

function randomString(options: { length: number }) {
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const values = crypto.getRandomValues(new Uint8Array(options.length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

function sha256(plain: string): Promise<ArrayBuffer> {
  return crypto.subtle.digest("SHA-256", new TextEncoder().encode(plain));
}

/**
 * Creates a PKCE code challenge.
 *
 * @see https://blog.postman.com/what-is-pkce/
 */
export async function createPkceChallenge(): Promise<[verifier: string, challenge: string]> {
  const codeVerifier = randomString({ length: 64 });
  const hashed = await sha256(codeVerifier);
  const codeChallenge = encodeBase64Url(hashed);

  return [codeVerifier, codeChallenge];
}
