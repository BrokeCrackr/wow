import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import InstallApp from "./InstallApp";

let standalone = false;

function dispatchInstallPrompt(options: {
  outcome?: "accepted" | "dismissed";
  failure?: boolean;
} = {}) {
  const prompt = options.failure
    ? vi.fn().mockRejectedValue(new Error("Browser prompt unavailable"))
    : vi.fn().mockResolvedValue(undefined);
  const event = Object.assign(
    new Event("beforeinstallprompt", { cancelable: true }),
    {
      prompt,
      userChoice: Promise.resolve({ outcome: options.outcome || "dismissed" }),
    },
  );
  act(() => { window.dispatchEvent(event); });
  return { event, prompt };
}

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
});

beforeEach(() => {
  vi.restoreAllMocks();
  standalone = false;
  vi.stubGlobal("matchMedia", vi.fn((media: string) => ({
    matches: standalone,
    media,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })));
});

describe("installable app guide", () => {
  it("opens a named, described guide without claiming a native prompt is available", async () => {
    const user = userEvent.setup();
    render(<InstallApp />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Get app" }));
    const dialog = screen.getByRole("dialog", { name: "Make room for a legend." });
    expect(dialog).toHaveAccessibleDescription(/Add Armory to your home screen or desktop/);
    expect(within(dialog).getByRole("heading", { name: "Open Armory in Chrome or Edge" })).toBeInTheDocument();
    expect(within(dialog).queryByRole("button", { name: "Install Armory" })).not.toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Close install guide" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows Safari Share and Add to Home Screen instructions on the iPhone platform", async () => {
    const user = userEvent.setup();
    render(<InstallApp />);
    await user.click(screen.getByRole("button", { name: "Get app" }));
    await user.click(screen.getByRole("button", { name: "iPhone / iPad" }));

    expect(screen.getByRole("button", { name: "iPhone / iPad" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Android / desktop" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("heading", { name: "Open Armory in Safari" })).toBeInTheDocument();
    expect(screen.getByText("Tap Safari’s Share button, then choose Add to Home Screen.")).toBeInTheDocument();
  });

  it("detects an iPhone and selects its installation instructions by default", async () => {
    vi.spyOn(navigator, "userAgent", "get").mockReturnValue("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)");
    const user = userEvent.setup();
    render(<InstallApp />);
    await user.click(screen.getByRole("button", { name: "Get app" }));
    expect(screen.getByRole("button", { name: "iPhone / iPad" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("heading", { name: "Open Armory in Safari" })).toBeInTheDocument();
  });

  it("requests a native prompt only after a click and consumes it after dismissal", async () => {
    const user = userEvent.setup();
    render(<InstallApp />);
    const { event, prompt } = dispatchInstallPrompt();
    expect(event.defaultPrevented).toBe(true);
    expect(prompt).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Install app" }));
    expect(prompt).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Install Armory" }));
    expect(prompt).toHaveBeenCalledTimes(1);
    expect(await screen.findByRole("status")).toHaveTextContent("You can install later.");
    expect(screen.queryByRole("button", { name: "Install Armory" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Get app" })).toBeInTheDocument();
    expect(screen.queryByText("App installed")).not.toBeInTheDocument();
  });

  it("keeps manual installation instructions available if the native prompt fails", async () => {
    const user = userEvent.setup();
    render(<InstallApp />);
    const { prompt } = dispatchInstallPrompt({ failure: true });
    await user.click(screen.getByRole("button", { name: "Install app" }));
    await user.click(screen.getByRole("button", { name: "Install Armory" }));

    expect(prompt).toHaveBeenCalledTimes(1);
    expect(await screen.findByRole("status")).toHaveTextContent("The install prompt couldn't open.");
    expect(screen.getByRole("heading", { name: "Add it to your apps" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Install Armory" })).not.toBeInTheDocument();
  });

  it("waits for the appinstalled event before showing installation as complete", async () => {
    const user = userEvent.setup();
    render(<InstallApp />);
    dispatchInstallPrompt({ outcome: "accepted" });
    await user.click(screen.getByRole("button", { name: "Install app" }));
    await user.click(screen.getByRole("button", { name: "Install Armory" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Installation requested.");
    expect(screen.queryByText("App installed")).not.toBeInTheDocument();

    act(() => { window.dispatchEvent(new Event("appinstalled")); });
    expect(screen.getByText("App installed")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Get app" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Install app" })).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("does not offer installation when already running in standalone mode", () => {
    standalone = true;
    render(<InstallApp />);
    expect(screen.getByText("App installed")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("closes the guide when the browser sends a dialog cancel event", async () => {
    const user = userEvent.setup();
    render(<InstallApp />);
    await user.click(screen.getByRole("button", { name: "Get app" }));
    fireEvent(screen.getByRole("dialog"), new Event("cancel", { bubbles: false, cancelable: true }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Get app" })).toBeInTheDocument();
  });
});
