"use server";

import { createClient } from "@/utils/supabase/server";
import { permitClient } from "@/utils/permit/client";
import { revalidatePath } from "next/cache";

type Role = "viewer" | "reviewer" | "editor";

const checkIsOwner = async (userId: string, workspaceId: string) => {
  const userWorkspaceRole = (await permitClient.getUserPermissions(userId, [
    `workspace:${workspaceId}`,
  ])) as any as UserPermissions;
  return (
    userWorkspaceRole[`workspace:${workspaceId}`]?.roles!.includes("owner") ||
    false
  );
};

export const addWorkspaceShare = async (
  workspaceId: string,
  userEmail: string,
  role: Role
) => {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Check if user has owner permission
  const isOwner = await checkIsOwner(user.id, workspaceId);
  if (!isOwner) return { error: "Permission denied" };

  // Get current share count
  const { count: currentShares } = await supabase
    .from("workspace_shares")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", workspaceId);

  if (currentShares && currentShares >= 5) {
    return { error: "Maximum share limit (5) reached" };
  }

  // Find target user by email
  const { data: targetUser } = await supabase
    .from("users")
    .select("id")
    .eq("email", userEmail)
    .single();

  if (!targetUser) return { error: "User not found" };

  // Check if share already exists
  const { data: existingShare } = await supabase
    .from("workspace_shares")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("shared_user_id", targetUser.id)
    .single();

  if (existingShare) return { error: "Share already exists" };

  // Create share record
  const { error: shareError } = await supabase.from("workspace_shares").insert({
    workspace_id: workspaceId,
    shared_user_id: targetUser.id,
    role,
  });

  if (shareError) return { error: "Failed to create share" };

  // Assign role in PermitIO
  try {
    await permitClient.api.users.assignRole({
      tenant: "default",
      user: targetUser.id,
      resource_instance: `workspace:${workspaceId}`,
      role: role,
    });
  } catch (error) {
    // Rollback share creation if role assignment fails
    await supabase
      .from("workspace_shares")
      .delete()
      .eq("workspace_id", workspaceId)
      .eq("shared_user_id", targetUser.id);
    return { error: "Failed to assign role" };
  }

  revalidatePath("/settings");
  return { success: true };
};

export const revokeWorkspaceShare = async (
  workspaceId: string,
  viewerUserId: string
) => {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Check if user has owner permission
  const isOwner = await checkIsOwner(user.id, workspaceId);
  if (!isOwner) return { error: "Permission denied" };

  // Delete share record
  const { error: shareError } = await supabase
    .from("workspace_shares")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("shared_user_id", viewerUserId);

  if (shareError) return { error: "Failed to revoke share" };

  // Remove role in PermitIO
  try {
    // Need to unassign each role individually since we don't know which one the user had
    const roles = ["viewer", "reviewer", "editor"] as const;
    for (const role of roles) {
      await permitClient.api.users.unassignRole({
        tenant: "default",
        user: viewerUserId,
        resource_instance: `workspace:${workspaceId}`,
        role,
      });
    }
  } catch (error) {
    // Log error but don't fail - share is already removed
    console.error("Failed to unassign role in PermitIO:", error);
  }

  revalidatePath("/settings");
  return { success: true };
};

export const updateWorkspaceShare = async (
  workspaceId: string,
  viewerUserId: string,
  newRole: Role
) => {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Check if user has owner permission
  const isOwner = await checkIsOwner(user.id, workspaceId);
  if (!isOwner) return { error: "Permission denied" };

  // Update share record
  const { error: shareError } = await supabase
    .from("workspace_shares")
    .update({ role: newRole })
    .eq("workspace_id", workspaceId)
    .eq("shared_user_id", viewerUserId);

  if (shareError) return { error: "Failed to update share" };

  // Update role in PermitIO - first remove all possible roles
  try {
    const roles = ["viewer", "reviewer", "editor"] as const;
    console.log("revoking access");
    for (const role of roles) {
      try {
        await permitClient.api.users.unassignRole({
          tenant: "default",
          user: viewerUserId,
          resource_instance: `workspace:${workspaceId}`,
          role,
        });
      } catch (error: any) {
        // Skip 404 errors (role doesn't exist), but throw other errors
        console.error(error.response?.status);
        if (error.response?.status !== 404) {
          console.error("Failed to unassign role:", error.code);
          throw new Error("Failed to unassign role in PermitIO");
        }
      }
    }

    console.log("assigning new role");
    // Assign new role
    await permitClient.api.users.assignRole({
      tenant: "default",
      user: viewerUserId,
      resource_instance: `workspace:${workspaceId}`,
      role: newRole,
    });
  } catch (error) {
    // Rollback share update if role assignment fails
    await supabase
      .from("workspace_shares")
      .update({ role: newRole })
      .eq("workspace_id", workspaceId)
      .eq("shared_user_id", viewerUserId);
    return { error: "Failed to update role" };
  }

  revalidatePath("/settings");
  return { success: true };
};

export const getSharedWorkspaces = async (userId: string) => {
  const supabase = await createClient();

  // Get shared workspaces for the user
  const { data: shares, error } = await supabase
    .from("workspace_shares")
    .select(
      `
      id,
      role,
      workspace_id,
      workspaces (
        id,
        owner_user_id,
        users (
          name
        )
      )
    `
    )
    .eq("shared_user_id", userId)
    .limit(5);

  if (error) {
    console.error("Error fetching shared workspaces:", error);
    return { error: "Failed to fetch shared workspaces" };
  }

  return { shares };
};

type UserPermissions = {
  [key: string]: {
    tenant: {
      key: string;
      attributes: Record<string, unknown>;
    };
    resource?: {
      key: string;
      attributes: Record<string, unknown>;
      type: string;
    };
    permissions: string[];
    roles: string[];
  };
};

export const getWorkspaceShares = async (workspaceId: string) => {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Check if user has owner permission
  const isOwner = await checkIsOwner(user.id, workspaceId);

  if (!isOwner) return { error: "Permission denied" };

  // Get all shares with user details
  const { data: shares, error } = await supabase
    .from("workspace_shares")
    .select(
      `
      id,
      role,
      granted_at,
      shared_user_id,
      users (
        email
      )
    `
    )
    .eq("workspace_id", workspaceId);

  if (error) {
    console.error("Error fetching shares:", error);
    return { error: "Failed to fetch shares" };
  }

  return { shares };
};
