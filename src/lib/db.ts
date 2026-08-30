import { getSupabase } from './supabase';
import type { Reservation, HostInquiry, Product, Popup, ProductRequest, POSTransaction, Terminal } from '../types';

// ── Reservations ─────────────────────────────────────────────────────────────

export async function saveReservation(reservation: Reservation): Promise<void> {
  const { error } = await getSupabase().from('reservations').insert({
    id: reservation.id,
    order_code: reservation.orderCode,
    popup_id: reservation.popupId,
    customer_name: reservation.customerName,
    email: reservation.email,
    phone: reservation.phone ?? null,
    items: reservation.items,
    bringing_own_container: reservation.bringingOwnContainer,
    estimated_total: reservation.estimatedTotal,
    status: reservation.status,
    created_at: reservation.createdAt,
  });
  if (error) throw new Error(error.message);
}

export async function getReservationsByPopup(popupId: string): Promise<Reservation[]> {
  const { data, error } = await getSupabase()
    .from('reservations')
    .select('*')
    .eq('popup_id', popupId)
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToReservation);
}

export async function updateReservationStatus(
  id: string,
  status: Reservation['status'],
): Promise<boolean> {
  const { data, error } = await getSupabase()
    .from('reservations')
    .update({ status })
    .eq('id', id)
    .select('id');
  if (error) throw new Error(error.message);
  return (data?.length ?? 0) > 0;
}

function rowToReservation(row: Record<string, unknown>): Reservation {
  return {
    id: row.id as string,
    orderCode: row.order_code as string,
    popupId: row.popup_id as string,
    customerName: row.customer_name as string,
    email: row.email as string,
    phone: (row.phone as string | null) ?? undefined,
    items: row.items as Reservation['items'],
    bringingOwnContainer: row.bringing_own_container as boolean,
    estimatedTotal: row.estimated_total as number,
    status: row.status as Reservation['status'],
    createdAt: row.created_at as string,
  };
}

// ── Host Inquiries ────────────────────────────────────────────────────────────

export async function saveHostInquiry(inquiry: HostInquiry): Promise<void> {
  const { error } = await getSupabase().from('host_inquiries').insert({
    id: inquiry.id,
    name: inquiry.name,
    organization: inquiry.organization,
    email: inquiry.email,
    phone: inquiry.phone ?? null,
    location_type: inquiry.locationType,
    estimated_audience: inquiry.estimatedAudience ?? null,
    message: inquiry.message,
    created_at: inquiry.createdAt,
  });
  if (error) throw new Error(error.message);
}

// ── Products ──────────────────────────────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await getSupabase()
    .from('products')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToProduct);
}

export async function updateProduct(
  id: string,
  fields: { available?: boolean; pricePerUnit?: number; taxable?: boolean },
): Promise<void> {
  const update: Record<string, unknown> = {};
  if (fields.available !== undefined) update.available = fields.available;
  if (fields.pricePerUnit !== undefined) update.price_per_unit = fields.pricePerUnit;
  if (fields.taxable !== undefined) update.taxable = fields.taxable;
  const { error } = await getSupabase().from('products').update(update).eq('id', id);
  if (error) throw new Error(error.message);
}

function rowToProduct(row: Record<string, unknown>): Product {
  return {
    id: row.id as string,
    name: row.name as string,
    category: row.category as Product['category'],
    unit: row.unit as Product['unit'],
    pricePerUnit: Number(row.price_per_unit),
    description: row.description as string,
    available: row.available as boolean,
    taxable: row.taxable as boolean,
    image: (row.image as string | null) ?? undefined,
  };
}

// ── Popups ────────────────────────────────────────────────────────────────────

export async function getAllPopups(): Promise<Popup[]> {
  const { data, error } = await getSupabase()
    .from('popups')
    .select('*')
    .order('starts_at', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToPopup);
}

export async function getUpcomingPopups(): Promise<Popup[]> {
  const all = await getAllPopups();
  const now = new Date();
  return all.filter((p) => p.status === 'scheduled' && new Date(p.endsAt) > now && p.isPublic);
}

export async function getPopupById(id: string): Promise<Popup | null> {
  const { data, error } = await getSupabase()
    .from('popups')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? rowToPopup(data as Record<string, unknown>) : null;
}

export async function savePopup(id: string, popup: Omit<Popup, 'id'>): Promise<void> {
  const { error } = await getSupabase()
    .from('popups')
    .upsert({ id, ...popupToRow({ id, ...popup } as Popup) }, { onConflict: 'id' });
  if (error) throw new Error(error.message);
}

export async function deletePopup(id: string): Promise<void> {
  const { error } = await getSupabase().from('popups').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

function rowToPopup(row: Record<string, unknown>): Popup {
  return {
    id: row.id as string,
    title: row.title as string,
    startsAt: row.starts_at as string,
    endsAt: row.ends_at as string,
    venueName: row.venue_name as string,
    address: row.address as string,
    city: row.city as Popup['city'],
    notes: (row.notes as string | null) ?? undefined,
    preordersEnabled: row.preorders_enabled as boolean,
    preorderCutoff: row.preorder_cutoff as string,
    status: row.status as Popup['status'],
    isPublic: row.is_public !== false, // default true if column missing
    geo:
      row.geo_lat != null && row.geo_lng != null
        ? { lat: Number(row.geo_lat), lng: Number(row.geo_lng) }
        : undefined,
  };
}

function popupToRow(popup: Popup): Record<string, unknown> {
  return {
    id: popup.id,
    title: popup.title,
    starts_at: popup.startsAt,
    ends_at: popup.endsAt,
    venue_name: popup.venueName,
    address: popup.address,
    city: popup.city,
    notes: popup.notes ?? null,
    preorders_enabled: popup.preordersEnabled,
    preorder_cutoff: popup.preorderCutoff,
    status: popup.status,
    is_public: popup.isPublic,
    geo_lat: popup.geo?.lat ?? null,
    geo_lng: popup.geo?.lng ?? null,
  };
}

// ── Product Requests ──────────────────────────────────────────────────────────

export async function saveProductRequest(request: Omit<ProductRequest, 'id' | 'createdAt'>): Promise<void> {
  const { error } = await getSupabase().from('product_requests').insert({
    product_name: request.productName,
    category: request.category ?? null,
    notes: request.notes ?? null,
    email: request.email ?? null,
    submitter_name: request.submitterName ?? null,
  });
  if (error) throw new Error(error.message);
}

export async function getProductRequests(): Promise<ProductRequest[]> {
  const { data, error } = await getSupabase()
    .from('product_requests')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    productName: row.product_name as string,
    category: (row.category as string | null) ?? undefined,
    notes: (row.notes as string | null) ?? undefined,
    email: (row.email as string | null) ?? undefined,
    submitterName: (row.submitter_name as string | null) ?? undefined,
    createdAt: row.created_at as string,
  }));
}

// ── POS Transactions ──────────────────────────────────────────────────────────

export async function savePOSTransaction(tx: POSTransaction): Promise<void> {
  const { error } = await getSupabase().from('pos_transactions').insert({
    id:                  tx.id,
    square_checkout_id:  tx.squareCheckoutId ?? null,
    amount_cents:        tx.amountCents,
    popup_id:            tx.popupId ?? null,
    status:              tx.status,
    created_at:          tx.createdAt,
  });
  if (error) throw new Error(error.message);
}

export async function getPOSTransactionByCheckoutId(squareCheckoutId: string): Promise<POSTransaction | null> {
  const { data, error } = await getSupabase()
    .from('pos_transactions')
    .select('*')
    .eq('square_checkout_id', squareCheckoutId)
    .maybeSingle();
  if (error) return null;
  return data ? rowToPOSTransaction(data as Record<string, unknown>) : null;
}

export async function updatePOSTransaction(
  id: string,
  status: POSTransaction['status'],
  squareTransactionId?: string,
  completedAt?: string,
): Promise<void> {
  const update: Record<string, unknown> = { status };
  if (squareTransactionId) update.square_transaction_id = squareTransactionId;
  if (completedAt) update.completed_at = completedAt;
  const { error } = await getSupabase()
    .from('pos_transactions')
    .update(update)
    .eq('id', id);
  if (error) throw new Error(error.message);
}

function rowToPOSTransaction(row: Record<string, unknown>): POSTransaction {
  return {
    id:                   row.id as string,
    squareTransactionId:  (row.square_transaction_id as string | null) ?? undefined,
    squareCheckoutId:     (row.square_checkout_id as string | null) ?? undefined,
    amountCents:          Number(row.amount_cents),
    popupId:              (row.popup_id as string | null) ?? undefined,
    status:               row.status as POSTransaction['status'],
    createdAt:            row.created_at as string,
    completedAt:          (row.completed_at as string | null) ?? undefined,
  };
}

// ── Terminals ─────────────────────────────────────────────────────────────────

export async function getActiveTerminal(): Promise<Terminal | null> {
  const { data, error } = await getSupabase()
    .from('terminals')
    .select('*')
    .eq('is_active', true)
    .maybeSingle();
  if (error) return null; // table may not exist yet
  return data ? rowToTerminal(data as Record<string, unknown>) : null;
}

export async function getAllTerminals(): Promise<Terminal[]> {
  const { data, error } = await getSupabase()
    .from('terminals')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return [];
  return (data ?? []).map(rowToTerminal);
}

export async function saveTerminal(
  terminal: Omit<Terminal, 'id' | 'createdAt'>,
): Promise<Terminal> {
  // Deactivate all others before saving a new active terminal
  if (terminal.isActive) {
    await getSupabase().from('terminals').update({ is_active: false }).neq('id', '');
  }
  const { data, error } = await getSupabase()
    .from('terminals')
    .insert({
      name:             terminal.name,
      square_device_id: terminal.squareDeviceId,
      location_id:      terminal.locationId,
      is_active:        terminal.isActive,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return rowToTerminal(data as Record<string, unknown>);
}

function rowToTerminal(row: Record<string, unknown>): Terminal {
  return {
    id:             row.id as string,
    name:           row.name as string,
    squareDeviceId: row.square_device_id as string,
    locationId:     row.location_id as string,
    isActive:       row.is_active as boolean,
    createdAt:      row.created_at as string,
  };
}
