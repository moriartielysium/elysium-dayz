import { api } from "./api";

export async function getAvailableGuilds() {
  return api("guilds-available");
}

export async function getGuildPublic(slug) {
  return api(`guild-public?slug=${encodeURIComponent(slug)}`);
}

export async function getGuildAccess(slug) {
  return api(`guild-access?slug=${encodeURIComponent(slug)}`);
}
