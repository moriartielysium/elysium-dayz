import { api } from './api';

const ZONE_ENDPOINTS = [
  // FastAPI backend is usually mounted as /api/zones. Through Netlify /api/* proxy
  // this must be requested as /api/api/zones, so the path below is intentional.
  'api/zones',
  'api/admin/zones',
  'api/zone-control',
  'api/zone-control/zones',
  'api/zones/admin',
  'admin-zones',
  'admin/zones',
  'zone-control',
  'zone-control/zones',
  'zones/admin',
  'zones',
];

const SETTINGS_ENDPOINTS = [
  'api/zones/settings',
  'api/admin/zones/settings',
  'api/zone-control/settings',
  'api/zone-control/admin/settings',
  'admin-zones-settings',
  'admin/zones/settings',
  'zones/settings',
  'zone-control/settings',
  'zone-control/admin/settings',
];

const EVENTS_ENDPOINTS = [
  'api/zones/events',
  'api/admin/zones/events',
  'api/zone-control/events',
  'api/zone-control/admin/events',
  'admin-zones-events',
  'admin/zones/events',
  'zones/events',
  'zone-control/events',
  'zone-control/admin/events',
];

const ENDPOINT_NOT_FOUND_STATUSES = new Set([404, 405, 501]);
const VALIDATION_STATUSES = new Set([400, 422]);

function withSlug(path, slug) {
  const joiner = path.includes('?') ? '&' : '?';
  const safeSlug = encodeURIComponent(slug || '');
  return `${path}${joiner}slug=${safeSlug}&guild_slug=${safeSlug}`;
}

function shouldTryNextEndpoint(error) {
  return ENDPOINT_NOT_FOUND_STATUSES.has(Number(error?.status));
}

function shouldTryNextPayload(error) {
  return VALIDATION_STATUSES.has(Number(error?.status));
}

async function tryEndpoints(paths, options) {
  let lastError;

  for (const path of paths) {
    try {
      return await api(path, options);
    } catch (error) {
      lastError = error;
      if (!shouldTryNextEndpoint(error)) break;
    }
  }

  throw lastError;
}

async function tryEndpointPayloads(paths, payloads, method = 'POST') {
  let lastError;

  for (const path of paths) {
    for (const payload of payloads) {
      try {
        return await api(path, {
          method,
          body: JSON.stringify(payload),
        });
      } catch (error) {
        lastError = error;
        if (shouldTryNextEndpoint(error)) break;
        if (shouldTryNextPayload(error)) continue;
        throw error;
      }
    }
  }

  throw lastError;
}

function firstDefined(...values) {
  return values.find((value) => value !== undefined && value !== null);
}

function toBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  return ['true', '1', 'yes', 'on', 'enabled'].includes(String(value).toLowerCase());
}

function toNumber(value, fallback = 0) {
  if (value === undefined || value === null || value === '') return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function normalizeZone(raw = {}) {
  return {
    id: firstDefined(raw.id, raw.zoneId, raw.zone_id, raw.uuid, raw.name),
    name: firstDefined(raw.name, raw.title, raw.zoneName, raw.zone_name, ''),
    description: firstDefined(raw.description, raw.note, ''),
    centerX: toNumber(firstDefined(raw.centerX, raw.center_x, raw.x, raw.posX, raw.pos_x), 0),
    centerZ: toNumber(firstDefined(raw.centerZ, raw.center_z, raw.z, raw.y, raw.posZ, raw.pos_z), 0),
    radius: toNumber(firstDefined(raw.radius, raw.captureRadius, raw.capture_radius), 100),
    captureSeconds: toNumber(firstDefined(raw.captureSeconds, raw.capture_seconds, raw.captureTime, raw.capture_time), 300),
    rewardAmount: toNumber(firstDefined(raw.rewardAmount, raw.reward_amount, raw.reward, raw.points), 0),
    color: firstDefined(raw.color, raw.mapColor, raw.map_color, '#f59e0b'),
    enabled: toBoolean(firstDefined(raw.enabled, raw.isEnabled, raw.is_enabled, raw.active, raw.is_active), true),
    ownerName: firstDefined(raw.ownerName, raw.owner_name, raw.owner, raw.clanName, raw.clan_name, ''),
    lastCapturedAt: firstDefined(raw.lastCapturedAt, raw.last_captured_at, raw.updatedAt, raw.updated_at, ''),
    raw,
  };
}

export function normalizeSettings(raw = {}) {
  return {
    enabled: toBoolean(firstDefined(raw.enabled, raw.isEnabled, raw.is_enabled, raw.active), true),
    announceChannelId: String(firstDefined(raw.announceChannelId, raw.announce_channel_id, raw.channelId, raw.channel_id, '') || ''),
    eventLogChannelId: String(firstDefined(raw.eventLogChannelId, raw.event_log_channel_id, raw.logChannelId, raw.log_channel_id, '') || ''),
    defaultCaptureSeconds: toNumber(firstDefined(raw.defaultCaptureSeconds, raw.default_capture_seconds, raw.captureSeconds, raw.capture_seconds), 300),
    defaultRewardAmount: toNumber(firstDefined(raw.defaultRewardAmount, raw.default_reward_amount, raw.rewardAmount, raw.reward_amount), 0),
    minPlayersToCapture: toNumber(firstDefined(raw.minPlayersToCapture, raw.min_players_to_capture, raw.minPlayers, raw.min_players), 1),
    tickSeconds: toNumber(firstDefined(raw.tickSeconds, raw.tick_seconds, raw.checkIntervalSeconds, raw.check_interval_seconds), 30),
  };
}

export function normalizeEvent(raw = {}) {
  return {
    id: firstDefined(raw.id, raw.eventId, raw.event_id, `${raw.created_at || raw.createdAt || ''}-${raw.zone_id || raw.zoneId || ''}`),
    type: firstDefined(raw.type, raw.eventType, raw.event_type, 'event'),
    zoneName: firstDefined(raw.zoneName, raw.zone_name, raw.zone, ''),
    playerName: firstDefined(raw.playerName, raw.player_name, raw.player, raw.discordName, raw.discord_name, ''),
    message: firstDefined(raw.message, raw.details, raw.text, ''),
    createdAt: firstDefined(raw.createdAt, raw.created_at, raw.timestamp, ''),
    raw,
  };
}

export function normalizeZonesPayload(payload = {}) {
  const zonesSource = Array.isArray(payload)
    ? payload
    : firstDefined(payload.zones, payload.items, payload.data, payload.results, []);

  const settingsSource = firstDefined(payload.settings, payload.config, payload.zoneSettings, payload.zone_settings, {});
  const eventsSource = firstDefined(payload.events, payload.recentEvents, payload.recent_events, []);

  return {
    meta: {
      guildId: firstDefined(payload.guildId, payload.guild_id, payload.guild?.id, ''),
      displayName: firstDefined(payload.displayName, payload.display_name, payload.guild?.name, ''),
    },
    settings: normalizeSettings(settingsSource || {}),
    zones: Array.isArray(zonesSource) ? zonesSource.map(normalizeZone) : [],
    events: Array.isArray(eventsSource) ? eventsSource.map(normalizeEvent) : [],
  };
}

export async function loadZonesAdmin(slug) {
  const combinedPaths = ZONE_ENDPOINTS.map((endpoint) => withSlug(endpoint, slug));
  const payload = await tryEndpoints(combinedPaths);
  const normalized = normalizeZonesPayload(payload);

  if (!payload?.settings && !payload?.config && !payload?.zoneSettings && !payload?.zone_settings) {
    try {
      const settingsPayload = await tryEndpoints(SETTINGS_ENDPOINTS.map((endpoint) => withSlug(endpoint, slug)));
      normalized.settings = normalizeSettings(settingsPayload?.settings || settingsPayload?.config || settingsPayload || {});
    } catch (error) {
      if (!shouldTryNextEndpoint(error)) throw error;
    }
  }

  if (!payload?.events && !payload?.recentEvents && !payload?.recent_events) {
    try {
      const eventsPayload = await tryEndpoints(EVENTS_ENDPOINTS.map((endpoint) => withSlug(endpoint, slug)));
      const events = Array.isArray(eventsPayload)
        ? eventsPayload
        : firstDefined(eventsPayload?.events, eventsPayload?.items, eventsPayload?.data, []);
      normalized.events = Array.isArray(events) ? events.map(normalizeEvent) : [];
    } catch (error) {
      if (!shouldTryNextEndpoint(error)) throw error;
    }
  }

  return normalized;
}

function zonePayloads(slug, form) {
  const baseCamel = {
    slug,
    name: String(form.name || '').trim(),
    description: String(form.description || '').trim(),
    centerX: toNumber(form.centerX, 0),
    centerZ: toNumber(form.centerZ, 0),
    radius: toNumber(form.radius, 100),
    captureSeconds: toNumber(form.captureSeconds, 300),
    rewardAmount: toNumber(form.rewardAmount, 0),
    color: String(form.color || '#f59e0b').trim(),
    enabled: Boolean(form.enabled),
  };

  const baseSnake = {
    slug,
    name: baseCamel.name,
    description: baseCamel.description,
    center_x: baseCamel.centerX,
    center_z: baseCamel.centerZ,
    radius: baseCamel.radius,
    capture_seconds: baseCamel.captureSeconds,
    reward_amount: baseCamel.rewardAmount,
    color: baseCamel.color,
    enabled: baseCamel.enabled,
  };

  return [baseCamel, baseSnake];
}

function settingsPayloads(slug, settings) {
  const baseCamel = {
    slug,
    enabled: Boolean(settings.enabled),
    announceChannelId: String(settings.announceChannelId || '').trim(),
    eventLogChannelId: String(settings.eventLogChannelId || '').trim(),
    defaultCaptureSeconds: toNumber(settings.defaultCaptureSeconds, 300),
    defaultRewardAmount: toNumber(settings.defaultRewardAmount, 0),
    minPlayersToCapture: toNumber(settings.minPlayersToCapture, 1),
    tickSeconds: toNumber(settings.tickSeconds, 30),
  };

  const baseSnake = {
    slug,
    enabled: baseCamel.enabled,
    announce_channel_id: baseCamel.announceChannelId,
    event_log_channel_id: baseCamel.eventLogChannelId,
    default_capture_seconds: baseCamel.defaultCaptureSeconds,
    default_reward_amount: baseCamel.defaultRewardAmount,
    min_players_to_capture: baseCamel.minPlayersToCapture,
    tick_seconds: baseCamel.tickSeconds,
  };

  return [baseCamel, baseSnake];
}

export async function saveZoneSettings(slug, settings) {
  return tryEndpointPayloads(SETTINGS_ENDPOINTS, settingsPayloads(slug, settings), 'POST');
}

export async function createZone(slug, form) {
  return tryEndpointPayloads(ZONE_ENDPOINTS, zonePayloads(slug, form), 'POST');
}

export async function updateZone(slug, zoneId, form) {
  const safeId = encodeURIComponent(zoneId);
  const paths = ZONE_ENDPOINTS.map((endpoint) => `${endpoint}/${safeId}`);
  return tryEndpointPayloads(paths, zonePayloads(slug, form), 'PUT');
}

export async function deleteZone(slug, zoneId) {
  const safeId = encodeURIComponent(zoneId);
  const paths = ZONE_ENDPOINTS.map((endpoint) => `${endpoint}/${safeId}`);
  return tryEndpointPayloads(paths, [{ slug }, { slug, id: zoneId }, { slug, zone_id: zoneId }], 'DELETE');
}
