-- Run this in the Supabase SQL editor to create the POS transactions table.

CREATE TABLE IF NOT EXISTS pos_transactions (
  id                    TEXT        PRIMARY KEY,
  square_transaction_id TEXT,
  square_checkout_id    TEXT,
  amount_cents          INTEGER     NOT NULL,
  popup_id              TEXT,
  status                TEXT        NOT NULL DEFAULT 'pending',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at          TIMESTAMPTZ
);

-- Optional: restrict access to the service role only
ALTER TABLE pos_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service role only" ON pos_transactions
  USING (auth.role() = 'service_role');
