"use client";

import { Loader2 } from "lucide-react";
import type { ToolInvocation } from "ai";

interface ToolCallBadgeProps {
  toolInvocation: ToolInvocation;
}

function getFileName(path: string): string {
  return path.split("/").pop() || path;
}

function getToolLabel(toolName: string, args: Record<string, unknown>): string {
  if (toolName === "str_replace_editor") {
    const command = args.command as string;
    const fileName = args.path ? getFileName(args.path as string) : null;
    switch (command) {
      case "create":
        return fileName ? `Creating ${fileName}` : "Creating file";
      case "str_replace":
      case "insert":
        return fileName ? `Editing ${fileName}` : "Editing file";
      case "view":
        return fileName ? `Reading ${fileName}` : "Reading file";
      case "undo_edit":
        return fileName ? `Undoing edit to ${fileName}` : "Undoing edit";
    }
  }

  if (toolName === "file_manager") {
    const command = args.command as string;
    const fileName = args.path ? getFileName(args.path as string) : null;
    switch (command) {
      case "rename":
        return fileName ? `Renaming ${fileName}` : "Renaming file";
      case "delete":
        return fileName ? `Deleting ${fileName}` : "Deleting file";
    }
  }

  return toolName;
}

export function ToolCallBadge({ toolInvocation }: ToolCallBadgeProps) {
  const { toolName, args, state } = toolInvocation;
  const isDone =
    state === "result" &&
    "result" in toolInvocation &&
    toolInvocation.result != null;
  const label = getToolLabel(toolName, args as Record<string, unknown>);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
      {isDone ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600 shrink-0" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
