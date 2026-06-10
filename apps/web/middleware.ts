import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

type CookieToSet = { name: string; value: string; options?: CookieOptions };

const APP_HOSTS = ['localhost', 'nexushub.app'];

/** Auth session refresh + custom domain → tenant rewrite (PRD §10). */
export async function middleware(req: NextRequest) {
  let response = NextResponse.next({ request: req });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookiesToSet: CookieToSet[]) => {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          response = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = req.nextUrl;
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');
  const isPublic = isAuthPage || pathname.startsWith('/api/auth');

  if (!user && !isPublic) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/feed', req.url));
  }

  // Custom domain routing: community.mysite.com → /t/{tenantSlug}/...
  const hostname = req.headers.get('host')?.split(':')[0] ?? '';
  const isCustomDomain = hostname !== '' && !APP_HOSTS.some((h) => hostname.endsWith(h));
  if (isCustomDomain && !pathname.startsWith('/t/')) {
    const { data: tenant } = await supabase
      .from('tenants')
      .select('slug')
      .eq('domain', hostname)
      .maybeSingle();
    if (tenant?.slug) {
      return NextResponse.rewrite(new URL(`/t/${tenant.slug}${pathname}`, req.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
