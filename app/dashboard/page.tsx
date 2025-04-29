import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

const page = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return redirect("/sign-in");
  }
  const { data: workspaceData, error: workspaceError } = await supabase
    .from("workspaces")
    .select("id")
    .eq("owner_user_id", user.id)
    .single();
  if (workspaceError) {
    return redirect("/");
  }
  return redirect(`/dashboard/${workspaceData.id}`);
};

export default page;
