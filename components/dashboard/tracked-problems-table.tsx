"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ReviewDialog } from "./review-dialog";
import { User } from "@supabase/supabase-js";

type TrackedProblem = {
  id: string;
  title: string;
  difficulty: string;
  next_review_date: Date;
  last_reviewed_at: Date | null;
  repetitions_count: number;
};

interface TrackedProblemsTableProps {
  problems: TrackedProblem[];
  type: "due" | "upcoming";
  user: User;
  userWorkspaceAccess: {
    read: boolean;
    create: boolean;
    review: boolean;
  };
}

export const TrackedProblemsTable = ({
  problems,
  type,
  user,
  userWorkspaceAccess,
}: TrackedProblemsTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Problem</TableHead>
            <TableHead>Difficulty</TableHead>
            <TableHead>{type === "due" ? "Due Date" : "Next Review"}</TableHead>
            <TableHead>Last Review</TableHead>
            {type === "due" && userWorkspaceAccess.review && (
              <TableHead>Action</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {problems.map((problem) => (
            <TableRow key={problem.id}>
              <TableCell className="font-medium">{problem.title}</TableCell>
              <TableCell>
                <Badge
                  className={[
                    problem.difficulty === "Easy" && "bg-green-500",
                    problem.difficulty === "Medium" && "bg-yellow-500",
                    problem.difficulty === "Hard" && "bg-red-500",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {problem.difficulty}
                </Badge>
              </TableCell>
              <TableCell>
                {problem.next_review_date.toLocaleDateString()}
              </TableCell>
              <TableCell>
                {problem.last_reviewed_at
                  ? problem.last_reviewed_at.toLocaleDateString()
                  : "Never"}
              </TableCell>
              {type === "due" && userWorkspaceAccess.review && (
                <TableCell>
                  <ReviewDialog
                    user={user}
                    trackedProblemId={problem.id}
                    problemTitle={problem.title}
                  />
                </TableCell>
              )}
            </TableRow>
          ))}
          {problems.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No {type === "due" ? "due" : "upcoming"} problems found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
