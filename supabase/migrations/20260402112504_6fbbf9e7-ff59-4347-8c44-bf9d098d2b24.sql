CREATE TABLE public.document_texts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.document_texts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read document texts"
ON public.document_texts FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Anyone can insert document texts"
ON public.document_texts FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Anyone can delete document texts"
ON public.document_texts FOR DELETE TO anon, authenticated USING (true);