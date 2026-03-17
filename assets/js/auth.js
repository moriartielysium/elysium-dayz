async function requireAuth() {
  const response = await fetch("/api/me", {
    credentials: "include"
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Auth failed: ${response.status}`);
  }

  return data.user;
}
