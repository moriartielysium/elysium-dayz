async function requireAuth() {
  try {
    const me = await apiGet("/api/me");
    return me.user;
  } catch {
    window.location.href = "/";
    return null;
  }
}
