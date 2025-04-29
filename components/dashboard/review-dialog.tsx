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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewTrackedProblem } from "./actions/problems";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";

const scores = [
  {
    value: "0",
    label: "Again (Blackout)",
    description: "Complete blackout",
    colorClass: "text-red-500 group-hover:text-red-600",
  },
  {
    value: "1",
    label: "Hard",
    description: "Still need to peek solution",
    colorClass: "text-orange-500 group-hover:text-orange-600",
  },
  {
    value: "2",
    label: "Good",
    description: "Correct but with some difficulty",
    colorClass: "text-yellow-500 group-hover:text-yellow-600",
  },
  {
    value: "3",
    label: "Easy",
    description: "Perfect response",
    colorClass: "text-green-500 group-hover:text-green-600",
  },
];

interface ReviewDialogProps {
  user: User;
  trackedProblemId: string;
  problemTitle: string;
}

export const ReviewDialog = ({
  user,
  trackedProblemId,
  problemTitle,
}: ReviewDialogProps) => {
  const [open, setOpen] = React.useState(false);
  const [selectedScore, setSelectedScore] = React.useState<string>();
  const queryClient = useQueryClient();

  const reviewMutation = useMutation({
    mutationFn: async () => {
      if (!selectedScore) return;
      const result = await reviewTrackedProblem(
        user,
        trackedProblemId,
        parseInt(selectedScore)
      );
      if ("error" in result) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      toast.success("Review submitted successfully");
      setOpen(false);
      // Invalidate all tracked problems queries to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ["tracked-problems"] });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit review"
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScore) {
      toast.error("Please select a score");
      return;
    }
    reviewMutation.mutate();
  };

  // Reset state when dialog closes
  React.useEffect(() => {
    if (!open) {
      setSelectedScore(undefined);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Review</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Review Problem: {problemTitle}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Label>How well did you solve this problem?</Label>
            <RadioGroup value={selectedScore} onValueChange={setSelectedScore}>
              {scores.map((score) => (
                <div
                  key={score.value}
                  className={`flex items-center space-x-2 p-3 rounded-lg transition-colors group hover:bg-accent ${
                    selectedScore === score.value ? "bg-accent" : ""
                  }`}
                >
                  <RadioGroupItem
                    value={score.value}
                    id={`score-${score.value}`}
                  />
                  <Label
                    htmlFor={`score-${score.value}`}
                    className="flex flex-col flex-1 cursor-pointer"
                  >
                    <span className={`font-medium ${score.colorClass}`}>
                      {score.label}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {score.description}
                    </span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!selectedScore || reviewMutation.isPending}
            >
              {reviewMutation.isPending ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
