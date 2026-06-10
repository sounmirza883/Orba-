-- 004_messaging_policies.sql
-- DM policies. Expected behavior (PRD §14):
--   dm_messages: anon ❌ | participant ✅ | owner ❌ (owner has NO read access to DMs)

CREATE POLICY "dm_threads_read" ON dm_threads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM dm_participants
      WHERE thread_id = dm_threads.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "dm_threads_insert" ON dm_threads FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "dm_participants_read" ON dm_participants FOR SELECT
  USING (
    -- can see participant rows of threads you belong to
    EXISTS (
      SELECT 1 FROM dm_participants me
      WHERE me.thread_id = dm_participants.thread_id AND me.user_id = auth.uid()
    )
  );

CREATE POLICY "dm_participants_insert" ON dm_participants FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Only participants can read messages — deliberately NO owner override.
CREATE POLICY "dm_messages_read" ON dm_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM dm_participants
      WHERE thread_id = dm_messages.thread_id
        AND user_id = auth.uid()
    )
  );

CREATE POLICY "dm_messages_insert" ON dm_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM dm_participants
      WHERE thread_id = dm_messages.thread_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "dm_messages_update_read_flag" ON dm_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM dm_participants
      WHERE thread_id = dm_messages.thread_id AND user_id = auth.uid()
    )
  );
