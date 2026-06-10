-- 005_courses_events_notifications_policies.sql
-- Courses, events, notifications.
-- Expected: notifications anon ❌ | member own only | owner all.

-- COURSES ------------------------------------------------------------------
CREATE POLICY "course_sections_read" ON course_sections FOR SELECT
  USING (public.has_space_access(space_id) OR public.is_owner());

CREATE POLICY "course_sections_write" ON course_sections FOR ALL
  USING (public.is_owner());

CREATE POLICY "course_lessons_read" ON course_lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM course_sections cs
      WHERE cs.id = course_lessons.section_id
        AND (public.has_space_access(cs.space_id) OR public.is_owner())
    )
  );

CREATE POLICY "course_lessons_write" ON course_lessons FOR ALL
  USING (public.is_owner());

CREATE POLICY "lesson_progress_read_own" ON lesson_progress FOR SELECT
  USING (user_id = auth.uid() OR public.is_owner());

CREATE POLICY "lesson_progress_insert_own" ON lesson_progress FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "lesson_progress_delete_own" ON lesson_progress FOR DELETE
  USING (user_id = auth.uid());

-- EVENTS ---------------------------------------------------------------------
CREATE POLICY "events_read" ON events FOR SELECT
  USING (public.has_space_access(space_id) OR public.is_owner());

CREATE POLICY "events_write" ON events FOR ALL
  USING (public.is_owner());

CREATE POLICY "event_rsvps_read" ON event_rsvps FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "event_rsvps_insert_own" ON event_rsvps FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "event_rsvps_delete_own" ON event_rsvps FOR DELETE
  USING (user_id = auth.uid());

-- NOTIFICATIONS ----------------------------------------------------------------
CREATE POLICY "notifications_read_own" ON notifications FOR SELECT
  USING (user_id = auth.uid() OR public.is_owner());

CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "notification_prefs_own" ON notification_preferences FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
