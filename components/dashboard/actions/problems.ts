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

export const reviewTrackedProblem = async (
  user: User,
  trackedProblemId: string,
  score: number
) => {
  // Implement the review logic here
  // This function should update the tracked problem's next review date,
  // repetitions count, and ease factor based on the user's input.
  // You can use the SM-2 algorithm for this.

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tracked_problems")
    .select("*")
    .eq("id", trackedProblemId)
    .single();

  if (error) {
    console.error("Error fetching tracked problem:", error);
    throw new Error("Failed to fetch tracked problem");
  }

  if (
    !(await permitClient.check(user.id, "review", {
      key: data.workspace_id,
      type: "workspace",
    }))
  ) {
    console.error(
      "Permission denied for user:",
      user.id,
      "on workspace:",
      data.workspace_id
    );
    return { error: "Permission denied" };
  }
  let nextReviewDate = new Date();
  nextReviewDate.setUTCHours(0, 0, 0, 0); // Set to start of UTC day

  // calculateFormulaFunction(n, score, learningSteps) = ((n reps - 2) * (review score / 3)) * learning steps
  const calculateFormulaFunction = (
    n: number,
    score: number,
    learningStep: number
  ) => {
    if (score === 0) {
      return 1;
    }
    if (n === 1) {
      return Math.round(n * (score / 3) * learningStep);
    }
    return Math.round((n - 1) * (score / 3) * learningStep);
  };

  // Learning steps [1,3,7]

  // if reps == 0, set interval to 1 day
  if (data.repetitions_count === 0) {
    // Set interval to 1 day
    nextReviewDate.setDate(nextReviewDate.getDate() + 1);
  }
  // if reps == 1, set interval to calulateFormulaFunction(1, score, 3)
  if (data.repetitions_count === 1) {
    // Set interval to calculateFormulaFunction(1, score, 3)
    nextReviewDate.setDate(
      nextReviewDate.getDate() +
        calculateFormulaFunction(data.repetitions_count, score, 3)
    );
  }

  // if reps == 2, set interval to calculateFormulaFunction(n reps, score, 7)
  if (data.repetitions_count >= 2) {
    nextReviewDate.setDate(
      nextReviewDate.getDate() +
        calculateFormulaFunction(data.repetitions_count, score, 7)
    );
  }

  const { error: updateError } = await supabase
    .from("tracked_problems")
    .update({
      next_review_date: nextReviewDate.toISOString(),
      repetitions_count: data.repetitions_count + 1,
      last_reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", trackedProblemId);

  const { error: createReviewError } = await supabase.from("reviews").insert({
    tracked_problem_id: trackedProblemId,
    quality_rating: score,
    reviewed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (updateError || createReviewError) {
    console.error(
      "Error updating tracked problem:",
      updateError || createReviewError
    );
    throw new Error("Failed to update tracked problem");
  }

  // Revalidate the page to show updated data
  revalidatePath(`/dashboard/${data.workspace_id}`);

  return { nextReviewDate };
};
