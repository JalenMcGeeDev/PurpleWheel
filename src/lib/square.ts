import { randomUUID } from 'crypto';

const SQUARE_BASE = 'https://connect.squareup.com/v2';
const SQUARE_VERSION = '2024-01-17';

function squareHeaders() {
  const token = process.env.SQUARE_ACCESS_TOKEN;
  if (!token) throw new Error('Missing SQUARE_ACCESS_TOKEN env var.');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Square-Version': SQUARE_VERSION,
  };
}

export async function getSquareLocations(): Promise<{ id: string; name: string }[]> {
  const res = await fetch(`${SQUARE_BASE}/locations`, { headers: squareHeaders() });
  const json = await res.json();
  return json.locations ?? [];
}

export async function createTerminalCheckout(opts: {
  amountCents: number;
  deviceId: string;
  locationId: string;
  referenceId: string;
}): Promise<{ checkoutId: string; status: string }> {
  const res = await fetch(`${SQUARE_BASE}/terminals/checkouts`, {
    method: 'POST',
    headers: squareHeaders(),
    body: JSON.stringify({
      idempotency_key: randomUUID(),
      checkout: {
        amount_money: { amount: opts.amountCents, currency: 'USD' },
        device_options: { device_id: opts.deviceId },
        reference_id: opts.referenceId,
        note: "Sunny's Garden",
      },
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.errors?.[0]?.detail ?? 'Square Terminal error');
  return { checkoutId: json.checkout.id, status: json.checkout.status };
}

export async function getTerminalCheckoutStatus(checkoutId: string): Promise<{
  squareStatus: string;
  squareTransactionId?: string;
}> {
  const res = await fetch(`${SQUARE_BASE}/terminals/checkouts/${checkoutId}`, {
    headers: squareHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.errors?.[0]?.detail ?? 'Square error');
  return {
    squareStatus: json.checkout.status,
    squareTransactionId: json.checkout.payment_ids?.[0],
  };
}

export async function createDeviceCode(locationId: string): Promise<{
  codeId: string;
  code: string;
  status: string;
}> {
  const res = await fetch(`${SQUARE_BASE}/devices/codes`, {
    method: 'POST',
    headers: squareHeaders(),
    body: JSON.stringify({
      idempotency_key: randomUUID(),
      device_code: { product_type: 'TERMINAL_API', location_id: locationId },
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.errors?.[0]?.detail ?? 'Square error');
  return { codeId: json.device_code.id, code: json.device_code.code, status: json.device_code.status };
}

export async function getDeviceCode(codeId: string): Promise<{
  codeId: string;
  code: string;
  status: string; // UNPAIRED | PAIRED | EXPIRED
  deviceId?: string;
}> {
  const res = await fetch(`${SQUARE_BASE}/devices/codes/${codeId}`, {
    headers: squareHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.errors?.[0]?.detail ?? 'Square error');
  const dc = json.device_code;
  return { codeId: dc.id, code: dc.code, status: dc.status, deviceId: dc.device_id };
}

