import { api } from "./api";

export function loginWithDiscord() {
  window.location.href = "/api/auth-login";
}

export async function logout() {
  return api("auth-logout", { method: "POST" });
}

export async function getMe() {
  return api("me");
}
