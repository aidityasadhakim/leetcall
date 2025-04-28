"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { permitClient } from "../utils/permit/client";

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required"
    );
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        name: formData.get("name")?.toString(),
      },
    },
  });
  console.log(error);

  if (user) {
    // Fetch user's created workspace
    const { data: workspaceData, error: workspaceError } = await supabase
      .from("workspaces")
      .select("id")
      .eq("owner_user_id", user.id)
      .single();

    if (workspaceError) {
      console.error("Error fetching workspace ID:", workspaceError);
      return encodedRedirect(
        "error",
        "/sign-up",
        "Could not fetch workspace ID"
      );
    }

    // If user exists, sync with Permit and create a new instance resource with the user's ID as the key
    try {
      await permitClient.api.createUser({
        key: user.id,
        email: user.email,
        first_name: formData.get("name")?.toString(),
      });
      await permitClient.api.syncUser({
        key: user.id,
        email: user.email,
        first_name: formData.get("name")?.toString(),
      });
      await permitClient.api.users.assignRole({
        user: user.id,
        role: "user",
        tenant: "default",
      });
    } catch (error) {
      console.error("Error syncing user with Permit:", error);
      return encodedRedirect(
        "error",
        "/sign-up",
        "Could not sync user with Permit"
      );
    }

    // Create a new resource instance for the user workspace in Permit
    try {
      await permitClient.api.resourceInstances.create({
        key: workspaceData.id,
        resource: "workspace",
        tenant: "default",
      });
    } catch (error) {
      console.error("Error creating user workspace in Permit:", error);
      return encodedRedirect(
        "error",
        "/sign-up",
        "Could not create user workspace in Permit"
      );
    }

    // Assign roles to the user's workspace in Permit
    try {
      await permitClient.api.users.assignRole({
        user: user.id,
        resource_instance: `workspace:${workspaceData.id}`,
        role: "owner",
      });
    } catch (error) {
      console.error("Error assigning roles to user workspace:", error);
    }
  }

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  } else {
    return encodedRedirect(
      "success",
      "/sign-up",
      "Thanks for signing up! Please check your email for a verification link."
    );
  }
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  const { data: workspaceData, error: workspaceError } = await supabase
    .from("workspaces")
    .select("id")
    .eq("owner_user_id", data.user?.id)
    .single();

  if (workspaceError) {
    console.error("Error fetching workspace ID:", workspaceError);
    return encodedRedirect("error", "/sign-in", "Could not fetch workspace ID");
  }

  return redirect(`/dashboard/${workspaceData.id}`);
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password"
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password."
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required"
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Passwords do not match"
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password update failed"
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};
