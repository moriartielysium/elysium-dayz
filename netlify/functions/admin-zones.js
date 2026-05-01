import { ok, badRequest, serverError } from './_shared/response.js';
import { parseJsonBody } from './_shared/validation.js';
import { createZoneForEvent, deleteZoneForEvent, loadZoneBundle, updateZoneForEvent } from './_shared/zones-db.js';

export const handler = async (event) => {
  try {
    if (event.httpMethod === 'GET') {
      return ok(await loadZoneBundle(event));
    }

    const body = parseJsonBody(event) || {};

    if (event.httpMethod === 'POST') {
      return ok(await createZoneForEvent(event, body));
    }

    if (event.httpMethod === 'PUT' || event.httpMethod === 'PATCH') {
      return ok(await updateZoneForEvent(event, body));
    }

    if (event.httpMethod === 'DELETE') {
      return ok(await deleteZoneForEvent(event, body));
    }

    return badRequest('Unsupported method');
  } catch (error) {
    if (error.statusCode === 400) return badRequest(error.message);
    if (error.statusCode === 404) return badRequest(error.message);
    console.error('admin-zones error:', error);
    return serverError(error.message || 'Zone Control request failed');
  }
};
