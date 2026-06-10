-- 002_content_policies.sql
-- Policies for spaces, posts, comments, reactions.
-- Expected behavior matrix (PRD §14):
--   posts:    anon ❌ | member ✅ if space access | owner ✅ all
--   comments: anon ❌ | member ✅ if space access | owner ✅ all
--   spaces:   anon: public spaces only | member: if tier access | owner: all

-- SPACES ---------------------------------------------------------------
CREATE POLICY "spaces_read" ON spaces FOR SELECT
  USING (is_private = false OR public.is_owner() OR public.has_space_access(id));

CREATE POLICY "spaces_insert" ON spaces FOR INSERT
  WITH CHECK (public.is_owner());

CREATE POLICY "spaces_update" ON spaces FOR UPDATE
  USING (public.is_owner());

CREATE POLICY "spaces_delete" ON spaces FOR DELETE
  USING (public.is_owner());

CREATE POLICY "space_tier_access_read" ON space_tier_access FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "space_tier_access_write" ON space_tier_access FOR ALL
  USING (public.is_owner());

-- POSTS ----------------------------------------------------------------
-- Expected: SELECT as anon → 0 rows. SELECT as tier-matched member → space posts.
CREATE POLICY "posts_read" ON posts FOR SELECT
  USING (
    is_hidden = false AND public.has_space_access(space_id)
    OR public.is_owner()
  );

CREATE POLICY "posts_insert" ON posts FOR INSERT
  WITH CHECK (author_id = auth.uid() AND public.has_space_access(space_id));

-- Only author or owner can edit.
CREATE POLICY "posts_update" ON posts FOR UPDATE
  USING (author_id = auth.uid() OR public.is_owner());

CREATE POLICY "posts_delete" ON posts FOR DELETE
  USING (author_id = auth.uid() OR public.is_owner());

-- COMMENTS ---------------------------------------------------------------
CREATE POLICY "comments_read" ON comments FOR SELECT
  USING (
    is_hidden = false
    AND EXISTS (
      SELECT 1 FROM posts WHERE posts.id = comments.post_id
        AND public.has_space_access(posts.space_id)
    )
    OR public.is_owner()
  );

CREATE POLICY "comments_insert" ON comments FOR INSERT
  WITH CHECK (
    author_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM posts WHERE posts.id = comments.post_id
        AND public.has_space_access(posts.space_id)
    )
  );

CREATE POLICY "comments_update" ON comments FOR UPDATE
  USING (author_id = auth.uid() OR public.is_owner());

CREATE POLICY "comments_delete" ON comments FOR DELETE
  USING (author_id = auth.uid() OR public.is_owner());

-- REACTIONS --------------------------------------------------------------
CREATE POLICY "reactions_read" ON reactions FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "reactions_insert" ON reactions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "reactions_delete" ON reactions FOR DELETE
  USING (user_id = auth.uid());
