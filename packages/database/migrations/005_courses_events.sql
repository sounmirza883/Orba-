-- 005_courses_events.sql
-- Courses (sections → lessons → progress) and Events with RSVPs.

CREATE TABLE course_sections (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id   UUID REFERENCES spaces(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

CREATE INDEX course_sections_space_idx ON course_sections(space_id, sort_order);

CREATE TABLE course_lessons (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES course_sections(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  type       TEXT DEFAULT 'text' CHECK (type IN ('text', 'video', 'download')),
  content    JSONB,
  sort_order INTEGER DEFAULT 0
);

CREATE INDEX course_lessons_section_idx ON course_lessons(section_id, sort_order);

CREATE TABLE lesson_progress (
  user_id      UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id    UUID REFERENCES course_lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, lesson_id)
);

CREATE TABLE events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id     UUID REFERENCES spaces(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  starts_at    TIMESTAMPTZ NOT NULL,
  ends_at      TIMESTAMPTZ,
  location_url TEXT,  -- Zoom/Meet link
  rsvp_limit   INTEGER,
  created_by   UUID REFERENCES profiles(id),
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX events_space_starts_idx ON events(space_id, starts_at);

CREATE TABLE event_rsvps (
  event_id   UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (event_id, user_id)
);
