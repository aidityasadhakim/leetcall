import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
// Components
import TrackedProblemsList from "@/components/dashboard/tracked-problems-list";
import Sidebar from "@/components/layout/sidebar";
import { Card } from "@/components/ui/card";

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
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    notFound();
  }

  // Check if this is the user's own dashboard
  const isOwnDashboard = user.id === params.id;

  return (
    <div className="flex min-h-screen">
      <Sidebar user={user} />
      <main className={`flex-1 transition-all duration-300 ml-64`}>
        <div className="container mx-auto space-y-6 p-6">
          {isOwnDashboard && (
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Add New Problem</h2>
              {/* <AddProblemSection userId={user.id} /> */}
            </Card>
          )}

          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Tracked Problems</h2>
            {/* <TrackedProblemsList
              problems={trackedProblems || []}
              isEditable={isOwnDashboard}
            /> */}
          </Card>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
