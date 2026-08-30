import type { Metadata } from 'next';
import { updatePOSTransaction } from '../../../../lib/db';

export const metadata: Metadata = {
  title: 'Payment Result - Admin',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

interface SquareCallback {
  status: string;
  transaction_id?: string;
  error_code?: string;
  error_description?: string;
}

function decodeSquareData(raw: string): SquareCallback | null {
  try {
    return JSON.parse(atob(raw)) as SquareCallback;
  } catch {
    return null;
  }
}

export default async function POSResultPage({
  searchParams,
}: {
  searchParams: Promise<{ txId?: string; data?: string; error_code?: string }>;
}) {
  const { txId, data: rawData, error_code } = await searchParams;

  if (!txId) {
    return <Result outcome="failed" message="Invalid callback - no transaction ID." />;
  }

  let status: 'completed' | 'cancelled' | 'failed' = 'failed';
  let squareTransactionId: string | undefined;
  let message = 'Payment failed.';

  if (error_code === 'payment_cancelled' || !rawData) {
    status = 'cancelled';
    message = 'Payment was cancelled.';
  } else {
    const payload = decodeSquareData(rawData);
    if (!payload) {
      message = 'Could not read Square response.';
    } else if (payload.status === 'ok') {
      status = 'completed';
      squareTransactionId = payload.transaction_id;
      message = 'Payment accepted.';
    } else if (payload.error_code === 'payment_cancelled') {
      status = 'cancelled';
      message = 'Payment was cancelled.';
    } else {
      message = payload.error_description ?? payload.error_code ?? 'Payment failed.';
    }
  }

  try {
    await updatePOSTransaction(
      txId,
      status,
      squareTransactionId,
      status === 'completed' ? new Date().toISOString() : undefined,
    );
  } catch { /* DB error doesn't affect the result shown to staff */ }

  return <Result outcome={status} message={message} />;
}

function Result({
  outcome,
  message,
}: {
  outcome: 'completed' | 'cancelled' | 'failed';
  message: string;
}) {
  const styles = {
    completed: { wrap: 'bg-green-50 border-green-200', heading: 'text-green-700', label: 'Payment complete!' },
    cancelled: { wrap: 'bg-white border-lilac',         heading: 'text-ink/60',    label: 'Cancelled' },
    failed:    { wrap: 'bg-red-50 border-red-200',       heading: 'text-red-600',   label: 'Payment failed' },
  }[outcome];

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-10">
      <p className="text-xs font-semibold uppercase tracking-widest text-purple mb-1">Admin</p>
      <h1 className="font-heading text-3xl text-purple-deep mb-8">Point of Sale</h1>

      <div className={`${styles.wrap} border rounded-2xl p-8 text-center space-y-3`}>
        <ResultIcon outcome={outcome} />
        <p className={`font-heading text-2xl ${styles.heading}`}>{styles.label}</p>
        <p className="text-sm text-ink/60">{message}</p>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <a
          href="/admin/calculator"
          className="block w-full py-3 text-center bg-purple text-white font-semibold text-sm rounded-xl hover:bg-purple-deep transition-colors"
        >
          New transaction
        </a>
        <a
          href="/admin"
          className="block w-full py-3 text-center border border-lilac text-ink/60 text-sm rounded-xl hover:bg-lilac/20 transition-colors"
        >
          ← Dashboard
        </a>
      </div>
    </div>
  );
}

function ResultIcon({ outcome }: { outcome: 'completed' | 'cancelled' | 'failed' }) {
  if (outcome === 'completed') {
    return (
      <div className="flex justify-center">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
    );
  }
  if (outcome === 'cancelled') {
    return (
      <div className="flex justify-center">
        <div className="w-14 h-14 rounded-full bg-lilac/30 flex items-center justify-center">
          <svg className="w-7 h-7 text-ink/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-center">
      <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
        <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      </div>
    </div>
  );
}

