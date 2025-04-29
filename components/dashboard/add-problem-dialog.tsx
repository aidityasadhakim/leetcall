"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  searchLeetCodeProblems,
  addTrackedProblem,
  getLeetCodeProblems,
} from "./actions/problems";
import type { LeetCodeProblem } from "./actions/problems";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

interface AddProblemDialogProps {
  user: User;
  workspaceId: string;
  onSuccess?: () => void;
}

// Memoized problem item component for better performance
const ProblemItem = React.memo(
  ({
    problem,
    isSelected,
    onClick,
  }: {
    problem: LeetCodeProblem;
    isSelected: boolean;
    onClick: () => void;
  }) => {
    const getDifficultyColor = (difficulty: string) => {
      switch (difficulty.toLowerCase()) {
        case "easy":
          return "bg-green-500 hover:bg-green-600";
        case "medium":
          return "bg-yellow-500 hover:bg-yellow-600";
        case "hard":
          return "bg-red-500 hover:bg-red-600";
        default:
          return "bg-gray-500 hover:bg-gray-600";
      }
    };

    return (
      <div
        className={cn(
          "p-3 cursor-pointer rounded-md transition-colors",
          isSelected ? "bg-muted" : "hover:bg-muted/50"
        )}
        onClick={onClick}
        role="option"
        aria-selected={isSelected}
        tabIndex={0}
      >
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="font-medium">
              {problem.frontend_question_id}. {problem.title}
              {problem.paid_only && (
                <Badge variant="outline" className="ml-2">
                  Premium
                </Badge>
              )}
            </p>
          </div>
          <Badge className={getDifficultyColor(problem.difficulty)}>
            {problem.difficulty}
          </Badge>
        </div>
      </div>
    );
  }
);

ProblemItem.displayName = "ProblemItem";

export const AddProblemDialog = ({
  user,
  workspaceId,
  onSuccess,
}: AddProblemDialogProps) => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch] = useDebounce(search, 300);
  const [selectedProblem, setSelectedProblem] =
    React.useState<LeetCodeProblem | null>(null);

  const { data: problems = [], isLoading } = useQuery({
    queryKey: ["leetcode-problems"],
    queryFn: () => getLeetCodeProblems(),
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const { data: trackedProblems, isLoading: isLoadingTrackedProblems } =
    useQuery({
      queryKey: ["tracked-problems", user.id, workspaceId],
      queryFn: async () => {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("tracked_problems")
          .select("*")
          .eq("workspace_id", workspaceId);
        if (error) {
          throw new Error("Failed to fetch tracked problems");
        }
        return data;
      },
      staleTime: 1000 * 60 * 60, // 1 hour
    });

  const filteredProblems = React.useMemo(() => {
    // If no tracked problems data yet, show loading state
    if (isLoadingTrackedProblems) return [];

    // Get all problem IDs that are already being tracked
    const trackedProblemIds = new Set(
      trackedProblems?.map((tp) => tp.problem_id) || []
    );

    // Filter problems that aren't tracked and match the search term
    const availableProblems = problems.filter(
      (problem) => !trackedProblemIds.has(problem.id)
    );

    if (!debouncedSearch) return availableProblems.slice(0, 20);
    return availableProblems.filter((problem) =>
      problem.title.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [debouncedSearch, problems, trackedProblems, isLoadingTrackedProblems]);

  const addProblemMutation = useMutation({
    mutationFn: async () => {
      const result = await addTrackedProblem(
        selectedProblem!.id,
        user,
        workspaceId
      );
      if (result.error) {
        toast.error("Failed to add problem to tracking");
        throw new Error(result.error);
      }
      setOpen(false);
      setSelectedProblem(null);
      setSearch("");
      toast.success("Problem added to tracking");
      onSuccess?.();
      return result.data;
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProblem) return;
    addProblemMutation.mutate();
  };

  const handleDialogOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setSelectedProblem(null);
      setSearch("");
    }
  };

  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent, problem: LeetCodeProblem) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setSelectedProblem(problem);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Problem
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Problem</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search">Search Problems</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by problem title..."
                className="w-full pl-9"
                autoComplete="off"
                autoFocus
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-[400px]">
              <p className="text-muted-foreground">Loading problems...</p>
            </div>
          ) : filteredProblems.length > 0 ? (
            <div
              className="relative"
              role="listbox"
              aria-label="LeetCode problems"
            >
              <ScrollArea className="h-[400px] overflow-y-auto">
                <div className="space-y-1">
                  {filteredProblems.map((problem) => (
                    <ProblemItem
                      key={problem.id}
                      problem={problem}
                      isSelected={selectedProblem?.id === problem.id}
                      onClick={() => setSelectedProblem(problem)}
                    />
                  ))}
                </div>
              </ScrollArea>
            </div>
          ) : (
            <p className="text-center text-muted-foreground h-[400px] flex items-center justify-center">
              No problems found
            </p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={!selectedProblem || addProblemMutation.isPending}
          >
            {addProblemMutation.isPending
              ? "Adding..."
              : "Add Selected Problem"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
