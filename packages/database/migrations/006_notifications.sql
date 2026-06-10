-- 006_notifications.sql
-- In-app notifications + gamification scaffold (member_points).

CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('mention', 'reply', 'new_post', 'reaction')),
  actor_id    UUID REFERENCES profiles(id),
  target_id   UUID,           -- post/comment ID
  target_type TEXT,
  is_read     BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX notifications_user_idx ON notifications(user_id, is_read, created_at DESC);

-- P2 gamification scaffold
CREATE TABLE member_points (
  user_id      UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  total_points INTEGER DEFAULT 0,
  updated_at   TIMESTAMPTZ DEFAULT now()
);

-- Notification preferences (per member, used by notification-service)
CREATE TABLE notification_preferences (
  user_id       UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  email_replies   BOOLEAN DEFAULT true,
  email_mentions  BOOLEAN DEFAULT true,
  email_new_posts BOOLEAN DEFAULT false,
  weekly_digest   BOOLEAN DEFAULT true,
  updated_at    TIMESTAMPTZ DEFAULT now()
);
