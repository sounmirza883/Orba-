'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSpaces, useMyProfile } from '@/lib/api/queries';

export function Sidebar() {
  const pathname = usePathname();
  const { data: spaces } = useSpaces();
  const { data: profile } = useMyProfile();

  return (
    <aside className="hidden w-60 shrink-0 border-r border-border bg-muted/30 p-4 md:block">
      <Link href="/feed" className="mb-6 block text-lg font-bold">
        NexusHub
      </Link>
      <nav className="space-y-1">
        <Link
          href="/feed"
          className={`block rounded-lg px-3 py-2 text-sm ${pathname === '/feed' ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'}`}
        >
          🏠 Home
        </Link>
        <Link
          href="/messages"
          className={`block rounded-lg px-3 py-2 text-sm ${pathname === '/messages' ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'}`}
        >
          ✉️ Messages
        </Link>
        <Link
          href="/events"
          className={`block rounded-lg px-3 py-2 text-sm ${pathname === '/events' ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'}`}
        >
          📅 Events
        </Link>
        <Link
          href="/settings"
          className={`block rounded-lg px-3 py-2 text-sm ${pathname === '/settings' ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'}`}
        >
          ⚙️ Settings
        </Link>
        <div className="pt-4 text-xs font-semibold uppercase text-foreground/40">Spaces</div>
        {spaces?.map((space) => {
          const href =
            space.type === 'course' ? `/courses/${space.slug}` : `/spaces/${space.slug}`;
          return (
            <Link
              key={space.id}
              href={href}
              className={`block rounded-lg px-3 py-2 text-sm ${pathname?.startsWith(href) ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'}`}
            >
              {space.icon} {space.name}
            </Link>
          );
        })}
        {profile?.is_owner && (
          <>
            <div className="pt-4 text-xs font-semibold uppercase text-foreground/40">Admin</div>
            <Link href="/dashboard" className="block rounded-lg px-3 py-2 text-sm hover:bg-muted">
              📊 Dashboard
            </Link>
            <Link href="/members" className="block rounded-lg px-3 py-2 text-sm hover:bg-muted">
              👥 Members
            </Link>
          </>
        )}
      </nav>
    </aside>
  );
}
