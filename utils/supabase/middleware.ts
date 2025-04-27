import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = [
  "/",
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
  "/auth/callback",
];

export const updateSession = async (request: NextRequest) => {
  try {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    const pathname = request.nextUrl.pathname;

    // Allow access to public routes regardless of auth status
    if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
      // Redirect authenticated users away from auth pages
      if (
        user &&
        (pathname.startsWith("/sign-in") ||
          pathname.startsWith("/sign-up") ||
          pathname.startsWith("/forgot-password") ||
          pathname === "/")
      ) {
        return NextResponse.redirect(
          new URL(`/dashboard/${user.id}`, request.url)
        );
      }
      return response;
    }

    // Protected routes - require authentication
    if (!user || error) {
      const searchParams = new URLSearchParams({
        redirectedFrom: pathname,
      });
      return NextResponse.redirect(
        new URL(`/sign-in?${searchParams}`, request.url)
      );
    }

    return response;
  } catch (e) {
    // If you are here, a Supabase client could not be created!
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
};
