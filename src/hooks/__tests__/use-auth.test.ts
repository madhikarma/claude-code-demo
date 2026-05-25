import { describe, test, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useAuth } from "@/hooks/use-auth";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock server actions
vi.mock("@/actions", () => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
}));

vi.mock("@/actions/get-projects", () => ({
  getProjects: vi.fn(),
}));

vi.mock("@/actions/create-project", () => ({
  createProject: vi.fn(),
}));

vi.mock("@/lib/anon-work-tracker", () => ({
  getAnonWorkData: vi.fn(),
  clearAnonWork: vi.fn(),
}));

import { signIn as signInAction, signUp as signUpAction } from "@/actions";
import { getProjects } from "@/actions/get-projects";
import { createProject } from "@/actions/create-project";
import { getAnonWorkData, clearAnonWork } from "@/lib/anon-work-tracker";

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getAnonWorkData as ReturnType<typeof vi.fn>).mockReturnValue(null);
    (getProjects as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (createProject as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "new-project-id" });
  });

  describe("initial state", () => {
    test("isLoading starts as false", () => {
      const { result } = renderHook(() => useAuth());
      expect(result.current.isLoading).toBe(false);
    });

    test("exposes signIn and signUp functions", () => {
      const { result } = renderHook(() => useAuth());
      expect(typeof result.current.signIn).toBe("function");
      expect(typeof result.current.signUp).toBe("function");
    });
  });

  describe("signIn", () => {
    test("returns success result on valid credentials", async () => {
      (signInAction as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });
      (getProjects as ReturnType<typeof vi.fn>).mockResolvedValue([{ id: "project-1" }]);

      const { result } = renderHook(() => useAuth());

      let returnValue: any;
      await act(async () => {
        returnValue = await result.current.signIn("user@example.com", "password123");
      });

      expect(returnValue).toEqual({ success: true });
    });

    test("returns error result on invalid credentials", async () => {
      (signInAction as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: false,
        error: "Invalid credentials",
      });

      const { result } = renderHook(() => useAuth());

      let returnValue: any;
      await act(async () => {
        returnValue = await result.current.signIn("user@example.com", "wrongpassword");
      });

      expect(returnValue).toEqual({ success: false, error: "Invalid credentials" });
      expect(mockPush).not.toHaveBeenCalled();
    });

    test("sets isLoading to true while signing in and false after", async () => {
      let resolveSignIn!: (value: any) => void;
      const pendingSignIn = new Promise((resolve) => { resolveSignIn = resolve; });
      (signInAction as ReturnType<typeof vi.fn>).mockReturnValue(pendingSignIn);
      (getProjects as ReturnType<typeof vi.fn>).mockResolvedValue([{ id: "project-1" }]);

      const { result } = renderHook(() => useAuth());

      act(() => {
        result.current.signIn("user@example.com", "password123");
      });

      await waitFor(() => expect(result.current.isLoading).toBe(true));

      await act(async () => {
        resolveSignIn({ success: true });
      });

      expect(result.current.isLoading).toBe(false);
    });

    test("resets isLoading to false even when signIn action throws", async () => {
      (signInAction as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        try {
          await result.current.signIn("user@example.com", "password123");
        } catch {
          // expected
        }
      });

      expect(result.current.isLoading).toBe(false);
    });

    test("calls signInAction with provided credentials", async () => {
      (signInAction as ReturnType<typeof vi.fn>).mockResolvedValue({ success: false, error: "Invalid credentials" });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "mypassword");
      });

      expect(signInAction).toHaveBeenCalledWith("test@example.com", "mypassword");
    });
  });

  describe("signUp", () => {
    test("returns success result on valid registration", async () => {
      (signUpAction as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });
      (getProjects as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      const { result } = renderHook(() => useAuth());

      let returnValue: any;
      await act(async () => {
        returnValue = await result.current.signUp("newuser@example.com", "password123");
      });

      expect(returnValue).toEqual({ success: true });
    });

    test("returns error result on failed registration", async () => {
      (signUpAction as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: false,
        error: "Email already registered",
      });

      const { result } = renderHook(() => useAuth());

      let returnValue: any;
      await act(async () => {
        returnValue = await result.current.signUp("existing@example.com", "password123");
      });

      expect(returnValue).toEqual({ success: false, error: "Email already registered" });
      expect(mockPush).not.toHaveBeenCalled();
    });

    test("sets isLoading to true while signing up and false after", async () => {
      let resolveSignUp!: (value: any) => void;
      const pendingSignUp = new Promise((resolve) => { resolveSignUp = resolve; });
      (signUpAction as ReturnType<typeof vi.fn>).mockReturnValue(pendingSignUp);
      (getProjects as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      const { result } = renderHook(() => useAuth());

      act(() => {
        result.current.signUp("newuser@example.com", "password123");
      });

      await waitFor(() => expect(result.current.isLoading).toBe(true));

      await act(async () => {
        resolveSignUp({ success: true });
      });

      expect(result.current.isLoading).toBe(false);
    });

    test("resets isLoading to false even when signUp action throws", async () => {
      (signUpAction as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        try {
          await result.current.signUp("user@example.com", "password123");
        } catch {
          // expected
        }
      });

      expect(result.current.isLoading).toBe(false);
    });

    test("calls signUpAction with provided credentials", async () => {
      (signUpAction as ReturnType<typeof vi.fn>).mockResolvedValue({ success: false });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signUp("new@example.com", "securepass");
      });

      expect(signUpAction).toHaveBeenCalledWith("new@example.com", "securepass");
    });
  });

  describe("post-sign-in navigation", () => {
    test("migrates anonymous work and redirects to new project", async () => {
      const anonWork = {
        messages: [{ id: "1", role: "user", content: "Hello" }],
        fileSystemData: { "/app.tsx": { type: "file", content: "export default () => <div/>" } },
      };
      (getAnonWorkData as ReturnType<typeof vi.fn>).mockReturnValue(anonWork);
      (signInAction as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });
      (createProject as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "migrated-project-id" });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("user@example.com", "password123");
      });

      expect(createProject).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: anonWork.messages,
          data: anonWork.fileSystemData,
        })
      );
      expect(clearAnonWork).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/migrated-project-id");
      expect(getProjects).not.toHaveBeenCalled();
    });

    test("does not migrate anonymous work when messages are empty", async () => {
      (getAnonWorkData as ReturnType<typeof vi.fn>).mockReturnValue({ messages: [], fileSystemData: {} });
      (signInAction as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });
      (getProjects as ReturnType<typeof vi.fn>).mockResolvedValue([{ id: "existing-project" }]);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("user@example.com", "password123");
      });

      expect(createProject).not.toHaveBeenCalled();
      expect(clearAnonWork).not.toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/existing-project");
    });

    test("redirects to most recent project when no anonymous work", async () => {
      (signInAction as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });
      (getProjects as ReturnType<typeof vi.fn>).mockResolvedValue([
        { id: "recent-project" },
        { id: "older-project" },
      ]);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("user@example.com", "password123");
      });

      expect(mockPush).toHaveBeenCalledWith("/recent-project");
      expect(createProject).not.toHaveBeenCalled();
    });

    test("creates a new project and redirects when user has no existing projects", async () => {
      (signInAction as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });
      (getProjects as ReturnType<typeof vi.fn>).mockResolvedValue([]);
      (createProject as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "brand-new-project" });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("user@example.com", "password123");
      });

      expect(createProject).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: [],
          data: {},
        })
      );
      expect(mockPush).toHaveBeenCalledWith("/brand-new-project");
    });

    test("new project name includes a random number suffix", async () => {
      (signInAction as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });
      (getProjects as ReturnType<typeof vi.fn>).mockResolvedValue([]);
      (createProject as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "new-id" });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("user@example.com", "password123");
      });

      const callArg = (createProject as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(callArg.name).toMatch(/^New Design #\d+$/);
    });

    test("signUp also triggers post-sign-in navigation", async () => {
      (signUpAction as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });
      (getProjects as ReturnType<typeof vi.fn>).mockResolvedValue([{ id: "first-project" }]);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signUp("newuser@example.com", "password123");
      });

      expect(mockPush).toHaveBeenCalledWith("/first-project");
    });

    test("does not navigate when sign in fails", async () => {
      (signInAction as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: false,
        error: "Invalid credentials",
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("user@example.com", "wrongpassword");
      });

      expect(mockPush).not.toHaveBeenCalled();
      expect(getProjects).not.toHaveBeenCalled();
      expect(createProject).not.toHaveBeenCalled();
    });

    test("does not navigate when sign up fails", async () => {
      (signUpAction as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: false,
        error: "Email already registered",
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signUp("existing@example.com", "password123");
      });

      expect(mockPush).not.toHaveBeenCalled();
      expect(getProjects).not.toHaveBeenCalled();
      expect(createProject).not.toHaveBeenCalled();
    });
  });
});
