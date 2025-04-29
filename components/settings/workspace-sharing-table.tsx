"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  revokeWorkspaceShare,
  updateWorkspaceShare,
} from "./actions/workspace-shares";
import { formatDistanceToNow } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Share {
  id: string;
  role: "viewer" | "reviewer" | "editor";
  granted_at: string;
  shared_user_id: string;
  users: {
    email: string;
  };
}

interface WorkspaceSharingTableProps {
  shares: Share[];
  workspaceId: string;
}

const ROLES = [
  { value: "viewer", label: "Viewer" },
  { value: "reviewer", label: "Reviewer" },
  { value: "editor", label: "Editor" },
] as const;

export const WorkspaceSharingTable = ({
  shares,
  workspaceId,
}: WorkspaceSharingTableProps) => {
  const [loading, setLoading] = useState<string | null>(null);

  const handleRevoke = async (viewerUserId: string) => {
    setLoading(viewerUserId);
    try {
      const result = await revokeWorkspaceShare(workspaceId, viewerUserId);
      if (result.error) {
        // TODO: Add toast notification
        console.error(result.error);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: Share["role"]) => {
    setLoading(userId);
    try {
      const result = await updateWorkspaceShare(workspaceId, userId, newRole);
      if (result.error) {
        // TODO: Add toast notification
        console.error(result.error);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  const getRoleBadgeVariant = (role: Share["role"]) => {
    switch (role) {
      case "viewer":
        return "secondary";
      case "reviewer":
        return "default";
      case "editor":
        return "destructive";
      default:
        return "secondary";
    }
  };

  if (shares.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No users have been granted access yet.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Granted</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shares.map((share) => (
            <TableRow key={share.id}>
              <TableCell>{share.users.email}</TableCell>
              <TableCell>
                <Select
                  value={share.role}
                  onValueChange={(value: Share["role"]) =>
                    handleRoleChange(share.shared_user_id, value)
                  }
                  disabled={loading === share.shared_user_id}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue>
                      <Badge variant={getRoleBadgeVariant(share.role)}>
                        {share.role}
                      </Badge>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <Badge variant={getRoleBadgeVariant(role.value)}>
                          {role.label}
                        </Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(share.granted_at), {
                  addSuffix: true,
                })}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRevoke(share.shared_user_id)}
                  disabled={loading === share.shared_user_id}
                >
                  {loading === share.shared_user_id ? "Revoking..." : "Revoke"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
