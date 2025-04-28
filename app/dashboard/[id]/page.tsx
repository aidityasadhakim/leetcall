import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
// Components
import TrackedProblemsList from "@/components/dashboard/tracked-problems-list";
import Sidebar from "@/components/layout/sidebar";
import { Card } from "@/components/ui/card";
import { TypographyH1, TypographyH2 } from "@/components/typography/typography";
import { permitClient } from "@/utils/permit/client";
import { UnauthorizedAccess } from "@/components/unauthorized-access";

// Types
interface TrackedProblem {
  id: string;
  problem_id: string;
  title: string;
  difficulty: string;
  ease_factor: number;
  repetitions_count: number;
  next_review_date: string;
  last_reviewed_at: string | null;
}

interface PageProps {
  id: string;
}

const DashboardPage = async (props: { params: Promise<PageProps> }) => {
  const supabase = await createClient();
  const params = await props.params;

  // Get the current user
  const { data: userData, error: userError } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    return redirect("/sign-in");
  }

  const { data: workspaceData, error: workspaceError } = await supabase
    .from("workspaces")
    .select("*")
    .eq("id", params.id)
    .single();
  const workspace = workspaceData;
  if (!workspace) {
    notFound();
  }

  if (userError || workspaceError) {
    notFound();
  }

  const userReadAccess = await permitClient.check(user.id, "read", {
    key: params.id,
    type: "workspace",
  });

  const userCreateAccess = await permitClient.check(user.id, "create", {
    key: params.id,
    type: "workspace",
  });

  // Return unauthorized access component if user doesn't have read access
  if (!userReadAccess) {
    return <UnauthorizedAccess />;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar user={user} />
      <main className="flex-1 transition-all duration-300">
        <div className="container mx-auto space-y-6 p-6 pt-32">
          <TypographyH1>Let's Grind!</TypographyH1>
          <Card className="p-6">
            <TypographyH2>Tracked Problems</TypographyH2>
            {/* <TrackedProblemsList
              problems={[]}
              isEditable={Boolean(userCreateAccess)}
            /> */}
          </Card>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
