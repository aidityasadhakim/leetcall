import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
// Components
import Sidebar from "@/components/layout/sidebar";
import { Card } from "@/components/ui/card";
import { TypographyH1, TypographyH2 } from "@/components/typography/typography";
import { permitClient } from "@/utils/permit/client";
import { UnauthorizedAccess } from "@/components/unauthorized-access";
import { TrackedProblemsTable } from "@/components/dashboard/tracked-problems-table";
import { AddProblemDialog } from "@/components/dashboard/add-problem-dialog";

interface PageProps {
  id: string;
}

interface TrackedProblemWithLeetCode {
  id: string;
  next_review_date: string;
  last_reviewed_at: string | null;
  repetitions_count: number;
  leet_code_problems: {
    title: string;
    difficulty: string;
  };
}

export const metadata = {
  title: "Dashboard | LeetCall",
  description:
    "Track and review your LeetCode problems using spaced repetition",
};

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

  const userWorkspaceAccess = {
    read: await permitClient.check(user.id, "read", {
      key: params.id,
      type: "workspace",
    }),
    create: await permitClient.check(user.id, "create", {
      key: params.id,
      type: "workspace",
    }),
    review: await permitClient.check(user.id, "review", {
      key: params.id,
      type: "workspace",
    }),
  };

  // Return unauthorized access component if user doesn't have read access
  if (!userWorkspaceAccess.read) {
    return <UnauthorizedAccess />;
  }

  // Fetch tracked problems
  const today = new Date().toISOString();
  const { data: trackedProblems } = (await supabase
    .from("tracked_problems")
    .select(
      `
      id,
      next_review_date,
      last_reviewed_at,
      repetitions_count,
      leet_code_problems (
        title,
        difficulty
      )
    `
    )
    .eq("workspace_id", params.id)
    .order("next_review_date", { ascending: true })) as {
    data: TrackedProblemWithLeetCode[] | null;
  };

  // Split problems into due and upcoming
  const dueProblems = (trackedProblems || [])
    .filter((tp) => new Date(tp.next_review_date) <= new Date())
    .map((tp) => ({
      id: tp.id,
      title: tp.leet_code_problems.title,
      difficulty: tp.leet_code_problems.difficulty,
      next_review_date: new Date(tp.next_review_date),
      last_reviewed_at: tp.last_reviewed_at
        ? new Date(tp.last_reviewed_at)
        : null,
      repetitions_count: tp.repetitions_count,
    }));

  const upcomingProblems = (trackedProblems || [])
    .filter((tp) => new Date(tp.next_review_date) > new Date())
    .map((tp) => ({
      id: tp.id,
      title: tp.leet_code_problems.title,
      difficulty: tp.leet_code_problems.difficulty,
      next_review_date: new Date(tp.next_review_date),
      last_reviewed_at: tp.last_reviewed_at
        ? new Date(tp.last_reviewed_at)
        : null,
      repetitions_count: tp.repetitions_count,
    }));

  return (
    <div className="flex min-h-screen">
      <Sidebar user={user} />
      <main className="flex-1">
        <div className="container mx-auto space-y-6 p-6 pt-32">
          <div className="flex justify-between items-center">
            <TypographyH1>Let&apos;s Grind! 🔥🔥🔥 </TypographyH1>
            {userWorkspaceAccess.create && (
              <AddProblemDialog user={user} workspaceId={params.id} />
            )}
          </div>

          <Card className="p-6">
            <TypographyH2>Due for Review</TypographyH2>
            <div className="mt-4">
              <TrackedProblemsTable
                user={user}
                problems={dueProblems}
                type="due"
                userWorkspaceAccess={userWorkspaceAccess}
              />
            </div>
          </Card>

          <Card className="p-6">
            <TypographyH2>Upcoming Reviews</TypographyH2>
            <div className="mt-4">
              <TrackedProblemsTable
                user={user}
                problems={upcomingProblems}
                type="upcoming"
                userWorkspaceAccess={userWorkspaceAccess}
              />
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
