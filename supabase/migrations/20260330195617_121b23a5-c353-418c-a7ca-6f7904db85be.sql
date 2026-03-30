-- Medicine reminders table
CREATE TABLE public.medicine_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  medicine_name TEXT NOT NULL,
  dosage TEXT,
  alarm_time TIME NOT NULL,
  days_of_week INTEGER[] NOT NULL DEFAULT '{0,1,2,3,4,5,6}',
  usual_location TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  alarm_sound TEXT NOT NULL DEFAULT 'default',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.medicine_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reminders"
  ON public.medicine_reminders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reminders"
  ON public.medicine_reminders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders"
  ON public.medicine_reminders FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reminders"
  ON public.medicine_reminders FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_medicine_reminders_updated_at
  BEFORE UPDATE ON public.medicine_reminders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Geofence zones table
CREATE TABLE public.geofence_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  radius_meters INTEGER NOT NULL DEFAULT 100,
  essential_items TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.geofence_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own zones"
  ON public.geofence_zones FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own zones"
  ON public.geofence_zones FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own zones"
  ON public.geofence_zones FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own zones"
  ON public.geofence_zones FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_geofence_zones_updated_at
  BEFORE UPDATE ON public.geofence_zones
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Geofence alert log
CREATE TABLE public.geofence_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  zone_id UUID REFERENCES public.geofence_zones(id) ON DELETE CASCADE NOT NULL,
  missing_items TEXT[] NOT NULL DEFAULT '{}',
  alert_type TEXT NOT NULL DEFAULT 'leaving',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.geofence_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own alerts"
  ON public.geofence_alerts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own alerts"
  ON public.geofence_alerts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);