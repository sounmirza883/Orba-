-- 001_enable_rls.sql
-- Enable Row Level Security on every application table.
-- RLS is the security core of NexusHub (PRD §11, §14).

ALTER TABLE tenants                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_tiers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE spaces                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE space_tier_access        ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions                ENABLE ROW LEVEL SECURITY;
ALTER TABLE dm_threads               ENABLE ROW LEVEL SECURITY;
ALTER TABLE dm_participants          ENABLE ROW LEVEL SECURITY;
ALTER TABLE dm_messages              ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_sections          ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons           ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress          ENABLE ROW LEVEL SECURITY;
ALTER TABLE events                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rsvps              ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications            ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_points            ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Helper: is the current user the community owner?
CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_owner = true);
$$;

-- Helper: does the current user have access to a space (open, owner, or tier match)?
CREATE OR REPLACE FUNCTION public.has_space_access(p_space_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM spaces s
    LEFT JOIN space_tier_access sta ON sta.space_id = s.id
    LEFT JOIN profiles p ON p.id = auth.uid()
    WHERE s.id = p_space_id
      AND (
        s.is_private = false        -- open space
        OR p.is_owner = true        -- community owner
        OR sta.tier_id = p.tier_id  -- member has the right tier
      )
  );
$$;
