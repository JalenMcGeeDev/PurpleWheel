-- Run this in the Supabase SQL editor at supabase.com/dashboard/project/_/sql

CREATE TABLE IF NOT EXISTS terminals (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  name         text        NOT NULL DEFAULT 'Square Terminal',
  square_device_id text    NOT NULL,
  location_id  text        NOT NULL,
  is_active    boolean     NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now()
);
