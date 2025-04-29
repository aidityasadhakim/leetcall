"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { addWorkspaceShare } from "./actions/workspace-shares";

interface AddShareDialogProps {
  workspaceId: string;
  currentShareCount: number;
}

export const AddShareDialog = ({
  workspaceId,
  currentShareCount,
}: AddShareDialogProps) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"viewer" | "reviewer" | "editor">("viewer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await addWorkspaceShare(workspaceId, email, role);
      if (result.error) {
        setError(result.error);
      } else {
        setOpen(false);
        setEmail("");
        setRole("viewer");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          disabled={currentShareCount >= 5}
          aria-label="Add new share"
        >
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Workspace</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="email">User Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter user email"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Access Role</Label>
            <RadioGroup
              value={role}
              onValueChange={(v: any) => setRole(v)}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="viewer" id="viewer" />
                <Label htmlFor="viewer">
                  Viewer - Can only view problems and progress
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="reviewer" id="reviewer" />
                <Label htmlFor="reviewer">
                  Reviewer - Can view and review problems
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="editor" id="editor" />
                <Label htmlFor="editor">
                  Editor - Can add/remove problems and review them
                </Label>
              </div>
            </RadioGroup>
          </div>

          {error && <div className="text-sm text-red-500">{error}</div>}

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !email}>
              {loading ? "Adding..." : "Add Share"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
