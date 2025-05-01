import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getWorkspaceShares } from "@/components/settings/actions/workspace-shares";
import { WorkspaceSharingTable } from "@/components/settings/workspace-sharing-table";
import { AddShareDialog } from "@/components/settings/add-share-dialog";
import { Card } from "@/components/ui/card";
import { TypographyH1, TypographyH2 } from "@/components/typography/typography";
import Sidebar from "@/components/layout/sidebar";

interface Share {
  id: string;
  role: "viewer" | "reviewer" | "editor";
  granted_at: string;
  shared_user_id: string;
  users: {
    email: string;
  };
}

const SettingsPage = async () => {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return redirect("/sign-in");
  }

  // Get user's workspace
  const { data: workspaceData } = await supabase
    .from("workspaces")
    .select("id")
    .eq("owner_user_id", userData.user.id)
    .single();

  if (!workspaceData) {
    return redirect("/");
  }

  const { shares, error } = await getWorkspaceShares(workspaceData.id);
  if (error) {
    // TODO: Handle error better
    console.error("Error fetching shares:", error);
    return null;
  }

  // Transform the data to match the expected Share interface
  const typedShares: Share[] = (shares || []).map((share: any) => ({
    id: share.id,
    role: share.role,
    granted_at: share.granted_at,
    shared_user_id: share.shared_user_id,
    users: {
      // The first user from the array is what we want since it's a one-to-one relation
      email: share.users.email || "",
    },
  }));

  return (
    <div className="flex min-h-screen">
      <Sidebar user={userData.user} />
      <main className="container py-6 space-y-8">
        <TypographyH1>Settings</TypographyH1>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <TypographyH2>Workspace Sharing</TypographyH2>
            <AddShareDialog
              workspaceId={workspaceData.id}
              currentShareCount={typedShares.length}
            />
          </div>

          <WorkspaceSharingTable
            workspaceId={workspaceData.id}
            shares={typedShares}
          />
        </Card>
      </main>
    </div>
  );
};

export default SettingsPage;
