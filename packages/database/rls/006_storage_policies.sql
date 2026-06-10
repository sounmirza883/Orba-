-- 006_storage_policies.sql
-- Supabase Storage buckets + object policies (PRD §11).

-- avatars: public read
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- post-media: authenticated read via RLS
INSERT INTO storage.buckets (id, name, public) VALUES ('post-media', 'post-media', false)
ON CONFLICT (id) DO NOTHING;

-- course-files: tier-gated content downloads
INSERT INTO storage.buckets (id, name, public) VALUES ('course-files', 'course-files', false)
ON CONFLICT (id) DO NOTHING;

-- Avatars: anyone reads, users write only to their own folder (avatars/{userId}/...)
CREATE POLICY "avatars_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars_insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "avatars_update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Post media: authenticated read, owner-folder write
CREATE POLICY "post_media_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'post-media' AND auth.role() = 'authenticated');

CREATE POLICY "post_media_insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'post-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Course files: authenticated read (tier enforcement at signing time in media-service)
CREATE POLICY "course_files_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'course-files' AND auth.role() = 'authenticated');

CREATE POLICY "course_files_insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'course-files' AND public.is_owner());
