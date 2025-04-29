"use server";
import { revalidatePath } from "next/cache";
import { permitClient } from "@/utils/permit/client";
import { createClient } from "@/utils/supabase/server";
import { User } from "@supabase/supabase-js";

export type LeetCodeProblem = {
  id: string;
  frontend_question_id: string;
  title: string;
  title_slug: string;
  difficulty: string;
  paid_only: boolean;
  topic_tags: string[];
};

export type TrackedProblem = {
  id: string;
  problem: LeetCodeProblem;
  next_review_date: Date;
  last_reviewed_at: Date | null;
  repetitions_count: number;
  ease_factor: number;
  interval_days: number;
};

export const getLeetCodeProblems = async () => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("leet_code_problems")
      .select("*")
      .order("frontend_question_id", { ascending: true });

    if (error) {
      throw new Error("Failed to fetch LeetCode problems");
    }

    return data as LeetCodeProblem[];
  } catch (error) {
    console.error("Error fetching LeetCode problems:", error);
    throw error;
  }
};

export const searchLeetCodeProblems = async (searchTerm: string = "") => {
  try {
    const supabase = await createClient();

    const query = supabase
      .from("leet_code_problems")
      .select("*")
      .order("frontend_question_id", { ascending: true });

    if (searchTerm) {
      query.ilike("title", `%${searchTerm}%`);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error("Failed to fetch LeetCode problems");
    }

    return data as LeetCodeProblem[];
  } catch (error) {
    console.error("Error searching LeetCode problems:", error);
    throw error;
  }
};

export const addTrackedProblem = async (
  problemId: string,
  user: User,
  workspaceId: string
) => {
  try {
    const supabase = await createClient();

    if (
      !(await permitClient.check(user.id, "create", {
        key: workspaceId,
        type: "workspace",
      }))
    ) {
      return { error: "Permission denied" };
    }

    // Use the provided workspaceId instead of fetching it
    const { data: workspace } = await supabase
      .from("workspaces")
      .select("id")
      .eq("id", workspaceId)
      .single();

    if (!workspace) return { error: "Workspace not found" };

    // Calculate initial review date (today)
    const initialReviewDate = new Date();

    // Add the problem to tracked_problems
    const { data, error } = await supabase
      .from("tracked_problems")
      .insert({
        workspace_id: workspace.id,
        problem_id: problemId,
        next_review_date: initialReviewDate.toISOString(),
        ease_factor: 2.5, // Initial ease factor per SM-2
        interval_days: 0, // Initial interval
        repetitions_count: 0, // Initial repetitions count
      })
      .select(
        `
        id,
        problem_id,
        next_review_date,
        last_reviewed_at,
        repetitions_count,
        ease_factor,
        interval_days,
        leet_code_problems (*)
      `
      )
      .single();

    if (error) {
      if (error.code === "23505") {
        // Unique constraint violation
        return { error: "Problem is already being tracked" };
      }
      return { error: `Failed to add problem to tracking: ${error.message}` };
    }

    // Revalidate the problems page to show the new problem
    revalidatePath(`/dashboard/${workspace.id}`);

    return { data };
  } catch (error) {
    console.error("Error adding tracked problem:", error);
    return { error: "An unexpected error occurred" };
  }
};
