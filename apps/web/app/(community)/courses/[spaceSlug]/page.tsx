'use client';

import { use, useState } from 'react';
import { useCompleteLesson, useCourse, useCourseProgress } from '@/lib/api/queries';

interface Lesson {
  id: string;
  title: string;
  type: 'text' | 'video' | 'download';
  content: unknown;
}

function LessonContent({ lesson }: { lesson: Lesson }) {
  const content = (lesson.content ?? {}) as { text?: string; url?: string };

  if (lesson.type === 'video' && content.url) {
    return (
      <iframe
        src={content.url}
        className="aspect-video w-full rounded-lg border border-border"
        allowFullScreen
        title={lesson.title}
      />
    );
  }
  if (lesson.type === 'download' && content.url) {
    return (
      <a href={content.url} className="btn-accent" download>
        Download file
      </a>
    );
  }
  return <p className="whitespace-pre-wrap text-sm">{content.text ?? 'No content yet.'}</p>;
}

export default function CoursePage({ params }: { params: Promise<{ spaceSlug: string }> }) {
  const { spaceSlug } = use(params);
  const { data: course, isLoading } = useCourse(spaceSlug);
  const { data: progress } = useCourseProgress(spaceSlug);
  const completeLesson = useCompleteLesson(spaceSlug);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  if (isLoading) return <div className="card h-40 animate-pulse" />;

  const completed = new Set(progress?.completedLessonIds ?? []);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <aside className="space-y-4">
        <div className="card">
          <div className="text-sm text-foreground/60">Progress</div>
          <div className="mt-1 text-2xl font-bold">{progress?.percentComplete ?? 0}%</div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-accent transition-all"
              style={{ width: `${progress?.percentComplete ?? 0}%` }}
            />
          </div>
        </div>

        {course?.sections.map((section) => (
          <div key={section.id} className="card">
            <h2 className="mb-2 text-sm font-semibold">{section.title}</h2>
            <div className="space-y-1">
              {section.lessons.map((lesson) => (
                <button
                  key={lesson.id}
                  onClick={() => setActiveLesson(lesson)}
                  className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm ${activeLesson?.id === lesson.id ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'}`}
                >
                  <span>{completed.has(lesson.id) ? '✅' : '⬜'}</span>
                  <span className="flex-1 truncate">{lesson.title}</span>
                  <span className="text-xs opacity-60">
                    {lesson.type === 'video' ? '▶' : lesson.type === 'download' ? '⬇' : '📄'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}

        {course?.sections.length === 0 && (
          <p className="text-sm text-foreground/50">No course content yet.</p>
        )}
      </aside>

      <main className="card md:col-span-2">
        {activeLesson ? (
          <div className="space-y-4">
            <h1 className="text-lg font-semibold">{activeLesson.title}</h1>
            <LessonContent lesson={activeLesson} />
            {!completed.has(activeLesson.id) && (
              <button
                className="btn-accent"
                onClick={() => completeLesson.mutate(activeLesson.id)}
                disabled={completeLesson.isPending}
              >
                {completeLesson.isPending ? 'Saving…' : 'Mark complete'}
              </button>
            )}
          </div>
        ) : (
          <p className="m-auto py-16 text-center text-sm text-foreground/50">
            Select a lesson to start learning
          </p>
        )}
      </main>
    </div>
  );
}
