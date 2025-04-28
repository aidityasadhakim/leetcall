import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the SSR package. It exchanges an auth code for the user's session.
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;
  const redirectTo = requestUrl.searchParams.get("redirect_to")?.toString();

  let user;
  const supabase = await createClient();
  if (code) {
    user = await supabase.auth.exchangeCodeForSession(code);
  }

  if (redirectTo) {
    return NextResponse.redirect(`${origin}${redirectTo}`);
  }

  const { data: workspaceData, error: workspaceError } = await supabase
    .from("workspaces")
    .select("id")
    .eq("owner_user_id", user?.data?.user?.id)
    .single();

  if (workspaceError) {
    return NextResponse.error();
  }

  // URL to redirect to after sign up process completes
  return NextResponse.redirect(`${origin}/dashboard/${workspaceData?.id}`); // Redirect to the user's dashboard
}
