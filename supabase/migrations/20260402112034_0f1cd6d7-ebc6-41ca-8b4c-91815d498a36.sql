INSERT INTO storage.buckets (id, name, public)
VALUES ('helpdesk-files', 'helpdesk-files', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can upload helpdesk files"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'helpdesk-files');

CREATE POLICY "Anyone can read helpdesk files"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'helpdesk-files');

CREATE POLICY "Anyone can delete helpdesk files"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id = 'helpdesk-files');