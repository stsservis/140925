/*
  # Create service records table

  1. New Tables
    - `service_records`
      - `id` (uuid, primary key)
      - `customer_name` (text)
      - `phone_number` (text)
      - `date` (date)
      - `fee_collected` (numeric)
      - `expenses` (numeric)
      - `description` (text)
      - `parts_changed` (text)
      - `status` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `service_records` table
    - Add policies for authenticated users to perform CRUD operations
*/

CREATE TABLE service_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  phone_number text NOT NULL,
  date date NOT NULL,
  fee_collected numeric NOT NULL DEFAULT 0,
  expenses numeric NOT NULL DEFAULT 0,
  description text NOT NULL,
  parts_changed text,
  status text NOT NULL CHECK (status IN ('ongoing', 'completed', 'workshop')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE service_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read service records"
  ON service_records
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert service records"
  ON service_records
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update service records"
  ON service_records
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete service records"
  ON service_records
  FOR DELETE
  TO authenticated
  USING (true);