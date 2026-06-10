-- 004_messaging.sql
-- Direct messages: threads, participants, messages.

CREATE TABLE dm_threads (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID REFERENCES tenants(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE dm_participants (
  thread_id UUID REFERENCES dm_threads(id) ON DELETE CASCADE,
  user_id   UUID REFERENCES profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (thread_id, user_id)
);

CREATE INDEX dm_participants_user_idx ON dm_participants(user_id);

CREATE TABLE dm_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id  UUID REFERENCES dm_threads(id) ON DELETE CASCADE,
  sender_id  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  body       TEXT NOT NULL,
  is_read    BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX dm_messages_thread_idx ON dm_messages(thread_id, created_at DESC);
