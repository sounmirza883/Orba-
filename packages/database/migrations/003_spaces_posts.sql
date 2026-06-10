-- 003_spaces_posts.sql
-- Spaces (channels/groups), tier gating, posts, comments, reactions.

CREATE TABLE spaces (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL,
  description TEXT,
  icon        TEXT DEFAULT '💬',
  type        TEXT DEFAULT 'discussion' CHECK (type IN ('discussion', 'course', 'events', 'directory')),
  is_private  BOOLEAN DEFAULT false,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, slug)
);

CREATE TABLE space_tier_access (
  space_id UUID REFERENCES spaces(id) ON DELETE CASCADE,
  tier_id  UUID REFERENCES membership_tiers(id) ON DELETE CASCADE,
  PRIMARY KEY (space_id, tier_id)
);

CREATE TABLE posts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id     UUID REFERENCES spaces(id) ON DELETE CASCADE,
  author_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title        TEXT,
  body         JSONB NOT NULL,              -- TipTap JSON document
  body_text    TEXT GENERATED ALWAYS AS (body::TEXT) STORED,  -- for FTS
  is_pinned    BOOLEAN DEFAULT false,
  is_hidden    BOOLEAN DEFAULT false,
  comment_count INTEGER DEFAULT 0,          -- denormalized for perf
  reaction_count INTEGER DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX posts_space_created_idx ON posts(space_id, created_at DESC);
CREATE INDEX posts_fts_idx ON posts USING GIN(to_tsvector('english', body_text));

CREATE TABLE comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID REFERENCES posts(id) ON DELETE CASCADE,
  parent_id  UUID REFERENCES comments(id) ON DELETE CASCADE,  -- threading
  author_id  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  body       TEXT NOT NULL,
  is_hidden  BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX comments_post_idx ON comments(post_id, created_at);

CREATE TABLE reactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_id   UUID NOT NULL,            -- post or comment ID
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'comment')),
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  emoji       TEXT NOT NULL DEFAULT '👍',
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(target_id, target_type, user_id, emoji)
);

CREATE INDEX reactions_target_idx ON reactions(target_id, target_type);

-- Keep denormalized counters in sync.
CREATE OR REPLACE FUNCTION public.sync_post_comment_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER comments_count_sync
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION public.sync_post_comment_count();

CREATE OR REPLACE FUNCTION public.sync_post_reaction_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.target_type = 'post' THEN
    UPDATE posts SET reaction_count = reaction_count + 1 WHERE id = NEW.target_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' AND OLD.target_type = 'post' THEN
    UPDATE posts SET reaction_count = GREATEST(reaction_count - 1, 0) WHERE id = OLD.target_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER reactions_count_sync
  AFTER INSERT OR DELETE ON reactions
  FOR EACH ROW EXECUTE FUNCTION public.sync_post_reaction_count();
