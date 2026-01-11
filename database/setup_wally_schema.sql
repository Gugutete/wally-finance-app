-- ============================================================================
-- Wally Database Schema Setup
-- Description: Complete schema for Wally project with RLS isolation
-- Target: Supabase PostgreSQL (shared with BusPro)
-- Schema: wally (isolated namespace)
-- Date: 2026-01-10
-- ============================================================================

-- Create dedicated schema for Wally
CREATE SCHEMA IF NOT EXISTS wally;

-- ============================================================================
-- TABLES
-- ============================================================================

-- Tenants table (multi-tenancy support)
CREATE TABLE wally.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles (linked to auth.users)
CREATE TABLE wally.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES wally.tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'member',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicles module
CREATE TABLE wally.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES wally.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES wally.profiles(id) ON DELETE CASCADE,
  targa TEXT NOT NULL,
  marca TEXT NOT NULL,
  modello TEXT NOT NULL,
  immatricolazione DATE NOT NULL,
  potenza_kw INTEGER NOT NULL,
  classe_ambientale TEXT NOT NULL,
  regione TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_targa_per_tenant UNIQUE(tenant_id, targa)
);

-- Vehicle deadlines
CREATE TABLE wally.vehicle_deadlines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES wally.vehicles(id) ON DELETE CASCADE,
  deadline_type TEXT NOT NULL CHECK (deadline_type IN ('bollo', 'revisione', 'assicurazione')),
  due_date DATE NOT NULL,
  amount DECIMAL(10,2),
  status TEXT NOT NULL CHECK (status IN ('paid', 'pending', 'overdue', 'ok', 'upcoming', 'active', 'expiring', 'expired')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- P.IVA profiles
CREATE TABLE wally.vat_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES wally.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES wally.profiles(id) ON DELETE CASCADE,
  partita_iva TEXT NOT NULL,
  codice_ateco TEXT NOT NULL,
  regime_fiscale TEXT NOT NULL DEFAULT 'forfettario',
  coefficiente_redditivita DECIMAL(5,2) NOT NULL DEFAULT 77.00,
  aliquota_imposta DECIMAL(5,2) NOT NULL DEFAULT 15.00,
  gestione_inps TEXT NOT NULL DEFAULT 'Gestione Separata',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_piva_per_tenant UNIQUE(tenant_id, partita_iva)
);

-- Tax/VAT deadlines
CREATE TABLE wally.tax_deadlines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vat_profile_id UUID NOT NULL REFERENCES wally.vat_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('upcoming', 'paid', 'overdue')),
  deadline_type TEXT NOT NULL CHECK (deadline_type IN ('imposta', 'inps', 'acconto', 'saldo')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Home expenses
CREATE TABLE wally.home_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES wally.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES wally.profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('luce', 'gas', 'acqua', 'internet', 'condominio', 'altro')),
  provider TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('mensile', 'bimestrale', 'trimestrale', 'semestrale', 'annuale')),
  status TEXT NOT NULL CHECK (status IN ('paid', 'pending', 'overdue')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calendar events (unified)
CREATE TABLE wally.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES wally.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES wally.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  module TEXT NOT NULL CHECK (module IN ('auto', 'piva', 'casa', 'general')),
  event_type TEXT NOT NULL,
  amount DECIMAL(10,2),
  reference_id UUID, -- Link to vehicle_deadlines, tax_deadlines, home_expenses
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE wally.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES wally.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('deadline', 'reminder', 'alert', 'info')),
  read BOOLEAN DEFAULT FALSE,
  related_module TEXT CHECK (related_module IN ('auto', 'piva', 'casa', 'general')),
  related_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_profiles_tenant ON wally.profiles(tenant_id);
CREATE INDEX idx_vehicles_tenant ON wally.vehicles(tenant_id);
CREATE INDEX idx_vehicles_user ON wally.vehicles(user_id);
CREATE INDEX idx_vehicle_deadlines_vehicle ON wally.vehicle_deadlines(vehicle_id);
CREATE INDEX idx_vehicle_deadlines_due_date ON wally.vehicle_deadlines(due_date);
CREATE INDEX idx_vat_profiles_tenant ON wally.vat_profiles(tenant_id);
CREATE INDEX idx_vat_profiles_user ON wally.vat_profiles(user_id);
CREATE INDEX idx_tax_deadlines_profile ON wally.tax_deadlines(vat_profile_id);
CREATE INDEX idx_tax_deadlines_due_date ON wally.tax_deadlines(due_date);
CREATE INDEX idx_home_expenses_tenant ON wally.home_expenses(tenant_id);
CREATE INDEX idx_home_expenses_user ON wally.home_expenses(user_id);
CREATE INDEX idx_home_expenses_due_date ON wally.home_expenses(due_date);
CREATE INDEX idx_calendar_events_tenant ON wally.calendar_events(tenant_id);
CREATE INDEX idx_calendar_events_user_date ON wally.calendar_events(user_id, event_date);
CREATE INDEX idx_notifications_user_read ON wally.notifications(user_id, read);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE wally.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE wally.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wally.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wally.vehicle_deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE wally.vat_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wally.tax_deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE wally.home_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE wally.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE wally.notifications ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's tenant
CREATE OR REPLACE FUNCTION wally.get_user_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM wally.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON wally.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON wally.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for vehicles
CREATE POLICY "Users can view vehicles in their tenant"
  ON wally.vehicles FOR SELECT
  USING (tenant_id = wally.get_user_tenant_id());

CREATE POLICY "Users can insert vehicles in their tenant"
  ON wally.vehicles FOR INSERT
  WITH CHECK (tenant_id = wally.get_user_tenant_id() AND user_id = auth.uid());

CREATE POLICY "Users can update their own vehicles"
  ON wally.vehicles FOR UPDATE
  USING (tenant_id = wally.get_user_tenant_id() AND user_id = auth.uid());

CREATE POLICY "Users can delete their own vehicles"
  ON wally.vehicles FOR DELETE
  USING (tenant_id = wally.get_user_tenant_id() AND user_id = auth.uid());

-- RLS Policies for vehicle_deadlines (via vehicle ownership)
CREATE POLICY "Users can view deadlines for their vehicles"
  ON wally.vehicle_deadlines FOR SELECT
  USING (vehicle_id IN (
    SELECT id FROM wally.vehicles WHERE tenant_id = wally.get_user_tenant_id()
  ));

CREATE POLICY "Users can manage deadlines for their vehicles"
  ON wally.vehicle_deadlines FOR ALL
  USING (vehicle_id IN (
    SELECT id FROM wally.vehicles WHERE user_id = auth.uid()
  ));

-- RLS Policies for vat_profiles
CREATE POLICY "Users can view VAT profiles in their tenant"
  ON wally.vat_profiles FOR SELECT
  USING (tenant_id = wally.get_user_tenant_id());

CREATE POLICY "Users can insert their own VAT profiles"
  ON wally.vat_profiles FOR INSERT
  WITH CHECK (tenant_id = wally.get_user_tenant_id() AND user_id = auth.uid());

CREATE POLICY "Users can update their own VAT profiles"
  ON wally.vat_profiles FOR UPDATE
  USING (tenant_id = wally.get_user_tenant_id() AND user_id = auth.uid());

CREATE POLICY "Users can delete their own VAT profiles"
  ON wally.vat_profiles FOR DELETE
  USING (tenant_id = wally.get_user_tenant_id() AND user_id = auth.uid());

-- RLS Policies for tax_deadlines
CREATE POLICY "Users can view tax deadlines for their VAT profiles"
  ON wally.tax_deadlines FOR SELECT
  USING (vat_profile_id IN (
    SELECT id FROM wally.vat_profiles WHERE tenant_id = wally.get_user_tenant_id()
  ));

CREATE POLICY "Users can manage tax deadlines for their VAT profiles"
  ON wally.tax_deadlines FOR ALL
  USING (vat_profile_id IN (
    SELECT id FROM wally.vat_profiles WHERE user_id = auth.uid()
  ));

-- RLS Policies for home_expenses
CREATE POLICY "Users can view home expenses in their tenant"
  ON wally.home_expenses FOR SELECT
  USING (tenant_id = wally.get_user_tenant_id());

CREATE POLICY "Users can insert their own home expenses"
  ON wally.home_expenses FOR INSERT
  WITH CHECK (tenant_id = wally.get_user_tenant_id() AND user_id = auth.uid());

CREATE POLICY "Users can update their own home expenses"
  ON wally.home_expenses FOR UPDATE
  USING (tenant_id = wally.get_user_tenant_id() AND user_id = auth.uid());

CREATE POLICY "Users can delete their own home expenses"
  ON wally.home_expenses FOR DELETE
  USING (tenant_id = wally.get_user_tenant_id() AND user_id = auth.uid());

-- RLS Policies for calendar_events
CREATE POLICY "Users can view calendar events in their tenant"
  ON wally.calendar_events FOR SELECT
  USING (tenant_id = wally.get_user_tenant_id());

CREATE POLICY "Users can insert their own calendar events"
  ON wally.calendar_events FOR INSERT
  WITH CHECK (tenant_id = wally.get_user_tenant_id() AND user_id = auth.uid());

CREATE POLICY "Users can update their own calendar events"
  ON wally.calendar_events FOR UPDATE
  USING (tenant_id = wally.get_user_tenant_id() AND user_id = auth.uid());

CREATE POLICY "Users can delete their own calendar events"
  ON wally.calendar_events FOR DELETE
  USING (tenant_id = wally.get_user_tenant_id() AND user_id = auth.uid());

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON wally.notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON wally.notifications FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION wally.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON wally.tenants
  FOR EACH ROW EXECUTE FUNCTION wally.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON wally.profiles
  FOR EACH ROW EXECUTE FUNCTION wally.update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at
  BEFORE UPDATE ON wally.vehicles
  FOR EACH ROW EXECUTE FUNCTION wally.update_updated_at_column();

CREATE TRIGGER update_vehicle_deadlines_updated_at
  BEFORE UPDATE ON wally.vehicle_deadlines
  FOR EACH ROW EXECUTE FUNCTION wally.update_updated_at_column();

CREATE TRIGGER update_vat_profiles_updated_at
  BEFORE UPDATE ON wally.vat_profiles
  FOR EACH ROW EXECUTE FUNCTION wally.update_updated_at_column();

CREATE TRIGGER update_tax_deadlines_updated_at
  BEFORE UPDATE ON wally.tax_deadlines
  FOR EACH ROW EXECUTE FUNCTION wally.update_updated_at_column();

CREATE TRIGGER update_home_expenses_updated_at
  BEFORE UPDATE ON wally.home_expenses
  FOR EACH ROW EXECUTE FUNCTION wally.update_updated_at_column();

CREATE TRIGGER update_calendar_events_updated_at
  BEFORE UPDATE ON wally.calendar_events
  FOR EACH ROW EXECUTE FUNCTION wally.update_updated_at_column();

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant usage on schema to authenticated users
GRANT USAGE ON SCHEMA wally TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA wally TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA wally TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA wally TO authenticated;

-- Grant usage on schema to anon users (for public access if needed)
GRANT USAGE ON SCHEMA wally TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA wally TO anon;

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================

-- Verify setup
DO $$
BEGIN
  RAISE NOTICE '✅ Wally schema setup complete!';
  RAISE NOTICE '✅ Tables created: tenants, profiles, vehicles, vehicle_deadlines, vat_profiles, tax_deadlines, home_expenses, calendar_events, notifications';
  RAISE NOTICE '✅ Indexes created for performance';
  RAISE NOTICE '✅ RLS policies enabled on all tables';
  RAISE NOTICE '✅ Triggers configured for updated_at columns';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Configure Nginx for api.wally.leomat.it';
  RAISE NOTICE '2. Install Supabase client in frontend';
  RAISE NOTICE '3. Create auth context and hooks';
END $$;
