import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge } from "../ToolCallBadge";
import type { ToolInvocation } from "ai";

afterEach(() => {
  cleanup();
});

// --- str_replace_editor ---

test("shows 'Creating <filename>' for str_replace_editor create command", () => {
  const tool: ToolInvocation = {
    toolCallId: "1",
    toolName: "str_replace_editor",
    args: { command: "create", path: "/src/components/Button.tsx" },
    state: "call",
  };
  render(<ToolCallBadge toolInvocation={tool} />);
  expect(screen.getByText("Creating Button.tsx")).toBeDefined();
});

test("shows 'Editing <filename>' for str_replace_editor str_replace command", () => {
  const tool: ToolInvocation = {
    toolCallId: "2",
    toolName: "str_replace_editor",
    args: { command: "str_replace", path: "/src/App.tsx" },
    state: "call",
  };
  render(<ToolCallBadge toolInvocation={tool} />);
  expect(screen.getByText("Editing App.tsx")).toBeDefined();
});

test("shows 'Editing <filename>' for str_replace_editor insert command", () => {
  const tool: ToolInvocation = {
    toolCallId: "3",
    toolName: "str_replace_editor",
    args: { command: "insert", path: "/src/index.ts" },
    state: "call",
  };
  render(<ToolCallBadge toolInvocation={tool} />);
  expect(screen.getByText("Editing index.ts")).toBeDefined();
});

test("shows 'Reading <filename>' for str_replace_editor view command", () => {
  const tool: ToolInvocation = {
    toolCallId: "4",
    toolName: "str_replace_editor",
    args: { command: "view", path: "/src/styles.css" },
    state: "call",
  };
  render(<ToolCallBadge toolInvocation={tool} />);
  expect(screen.getByText("Reading styles.css")).toBeDefined();
});

test("shows 'Undoing edit to <filename>' for str_replace_editor undo_edit command", () => {
  const tool: ToolInvocation = {
    toolCallId: "5",
    toolName: "str_replace_editor",
    args: { command: "undo_edit", path: "/src/App.tsx" },
    state: "call",
  };
  render(<ToolCallBadge toolInvocation={tool} />);
  expect(screen.getByText("Undoing edit to App.tsx")).toBeDefined();
});

// --- file_manager ---

test("shows 'Renaming <filename>' for file_manager rename command", () => {
  const tool: ToolInvocation = {
    toolCallId: "6",
    toolName: "file_manager",
    args: { command: "rename", path: "/src/OldName.tsx", new_path: "/src/NewName.tsx" },
    state: "call",
  };
  render(<ToolCallBadge toolInvocation={tool} />);
  expect(screen.getByText("Renaming OldName.tsx")).toBeDefined();
});

test("shows 'Deleting <filename>' for file_manager delete command", () => {
  const tool: ToolInvocation = {
    toolCallId: "7",
    toolName: "file_manager",
    args: { command: "delete", path: "/src/Unused.tsx" },
    state: "call",
  };
  render(<ToolCallBadge toolInvocation={tool} />);
  expect(screen.getByText("Deleting Unused.tsx")).toBeDefined();
});

// --- unknown tool fallback ---

test("falls back to raw tool name for unknown tools", () => {
  const tool: ToolInvocation = {
    toolCallId: "8",
    toolName: "some_other_tool",
    args: {},
    state: "call",
  };
  render(<ToolCallBadge toolInvocation={tool} />);
  expect(screen.getByText("some_other_tool")).toBeDefined();
});

// --- loading vs done state ---

test("shows spinner when tool call is in-progress", () => {
  const tool: ToolInvocation = {
    toolCallId: "9",
    toolName: "str_replace_editor",
    args: { command: "create", path: "/src/Card.tsx" },
    state: "call",
  };
  const { container } = render(<ToolCallBadge toolInvocation={tool} />);
  expect(container.querySelector(".animate-spin")).not.toBeNull();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("shows green dot when tool call has a result", () => {
  const tool: ToolInvocation = {
    toolCallId: "10",
    toolName: "str_replace_editor",
    args: { command: "create", path: "/src/Card.tsx" },
    state: "result",
    result: "File created successfully",
  };
  const { container } = render(<ToolCallBadge toolInvocation={tool} />);
  expect(container.querySelector(".bg-emerald-500")).not.toBeNull();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

test("shows spinner when state is result but result is null", () => {
  const tool: ToolInvocation = {
    toolCallId: "11",
    toolName: "str_replace_editor",
    args: { command: "create", path: "/src/Card.tsx" },
    state: "result",
    result: null,
  };
  const { container } = render(<ToolCallBadge toolInvocation={tool} />);
  expect(container.querySelector(".animate-spin")).not.toBeNull();
});
