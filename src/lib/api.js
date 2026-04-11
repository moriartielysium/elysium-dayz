export async function api(path, options = {}) {
  const response = await fetch(`/api/${path.replace(/^\/+/, "")}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new Error(payload?.error || payload?.message || "API request failed");
  }

  return payload;
}
