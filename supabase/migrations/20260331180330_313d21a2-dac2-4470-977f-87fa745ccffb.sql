
CREATE TABLE public.detected_objects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  confidence integer NOT NULL DEFAULT 0,
  size text NOT NULL DEFAULT 'medium',
  location text NOT NULL DEFAULT '',
  image_url text,
  status text NOT NULL DEFAULT 'safe',
  last_seen_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.detected_objects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own detected objects" ON public.detected_objects
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own detected objects" ON public.detected_objects
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own detected objects" ON public.detected_objects
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own detected objects" ON public.detected_objects
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
