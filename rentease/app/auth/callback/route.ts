import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/profile';

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // ignore failures in some server environments
          }
        },
      },
    }
  );

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      // log for server-side debugging and send user back to login with info
      console.error('Supabase OAuth exchange error:', error);
      return NextResponse.redirect(
        `${origin}/login?oauth_error=1&msg=${encodeURIComponent(error.message ?? 'unknown')}`
      );
    }

    // Successful exchange with a session -> go to requested next (default /profile)
    if (data?.session) {
      // Ensure a profile row exists (id = auth.user.id). Avoid assuming an email column.
      try {
        const user = data.user;
        if (user?.id) {
          await supabase
            .from('profiles')
            .upsert(
              {
                id: user.id,
                full_name: (user.user_metadata as any)?.full_name ?? null,
                updated_at: new Date().toISOString()
              },
              { onConflict: 'id' }
            );
        }
      } catch (e) {
        console.error('Profile upsert failed (non-blocking):', e);
      }

      // If this OAuth flow originated from signup (next=/login), enforce login step by clearing session
      if (next.startsWith('/login')) {
        try {
          await supabase.auth.signOut();
        } catch (e) {
          console.error('Sign out after OAuth signup failed (non-blocking):', e);
        }
        const emailParam = data.user?.email ? `&email=${encodeURIComponent(data.user.email)}` : '';
        return NextResponse.redirect(`${origin}/login?signup_complete=1${emailParam}`);
      }

      // Otherwise, respect requested next
      const redirectUrl = next.startsWith('http') ? next : `${origin}${next}`;
      return NextResponse.redirect(redirectUrl);
    }

    // No session (e.g. account created but not signed in) -> send to sign-in page
    return NextResponse.redirect(`${origin}/login?signup_complete=1`);
  }

  return NextResponse.redirect(`${origin}/login?oauth_error=1`);
}