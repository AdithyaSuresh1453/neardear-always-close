
CREATE TABLE public.connected_devices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  device_name TEXT NOT NULL,
  device_type TEXT NOT NULL DEFAULT 'phone',
  is_connected BOOLEAN NOT NULL DEFAULT false,
  battery_level INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.connected_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own devices" ON public.connected_devices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own devices" ON public.connected_devices FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own devices" ON public.connected_devices FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own devices" ON public.connected_devices FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_connected_devices_updated_at
BEFORE UPDATE ON public.connected_devices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
