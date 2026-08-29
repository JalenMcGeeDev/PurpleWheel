export interface Popup {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  venueName: string;
  address: string;
  city: 'Raleigh' | 'Durham' | 'Chapel Hill' | 'Other';
  notes?: string;
  preordersEnabled: boolean;
  preorderCutoff: string;
  status: 'scheduled' | 'cancelled';
  geo?: { lat: number; lng: number };
}

export interface Product {
  id: string;
  name: string;
  category: 'Pantry' | 'Home' | 'Body';
  unit: 'per lb' | 'per oz' | 'per fl oz' | 'each';
  pricePerUnit: number;
  description: string;
  available: boolean;
  taxable: boolean;
  image?: string;
}

export interface ReservationItem {
  productId: string;
  productName: string;
  requestedAmount: number;
  unit: string;
  pricePerUnit: number;
  estimatedCost: number;
}

export interface Reservation {
  id: string;
  orderCode: string;
  popupId: string;
  customerName: string;
  email: string;
  phone?: string;
  items: ReservationItem[];
  bringingOwnContainer: boolean;
  estimatedTotal: number;
  status: 'new' | 'prepped' | 'collected' | 'no-show';
  createdAt: string;
}

export interface HostInquiry {
  id: string;
  name: string;
  organization: string;
  email: string;
  phone?: string;
  locationType: 'office' | 'apartment community' | 'retail' | 'other';
  estimatedAudience?: string;
  message: string;
  createdAt: string;
}

export interface ProductRequest {
  id: string;
  productName: string;
  category?: string;
  notes?: string;
  email?: string;
  submitterName?: string;
  createdAt: string;
}

export interface SiteSettings {
  tagline: string;
  discountPercentage: number;
  contactEmail: string;
  instagramHandle: string;
  jarDepositAmount: number;
}

export interface POSTransaction {
  id: string;
  squareTransactionId?: string;
  amountCents: number;
  popupId?: string;
  status: 'pending' | 'completed' | 'cancelled' | 'failed';
  createdAt: string;
  completedAt?: string;
}
