export function mockGetJwtSubject(token: string | null) {
  if (!token) {
    return null;
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1] ?? ""));
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

export function mockMakeJwt(address: string) {
  const header = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" })).replace(
    /=/g,
    "",
  );
  const now = Math.floor(Date.now() / 1000);
  const payload = btoa(
    JSON.stringify({
      sub: address,
      sessionId: crypto.randomUUID(),
      iat: now,
      exp: now + 900,
      iss: "siwe-middleware-demo",
    }),
  ).replace(/=/g, "");
  const fakeSig = btoa(crypto.randomUUID()).replace(/=/g, "");
  return `${header}.${payload}.${fakeSig}`;
}

export function mockMakeRefreshToken() {
  const arr = new Uint8Array(36);
  crypto.getRandomValues(arr);
  return btoa(String.fromCharCode(...arr))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}
