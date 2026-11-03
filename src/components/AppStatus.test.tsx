import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AppStatus from "./AppStatus";

const serviceWorker = vi.hoisted(() => ({
  offlineReady: false,
  needRefresh: false,
  setOfflineReady: vi.fn(),
  setNeedRefresh: vi.fn(),
  updateServiceWorker: vi.fn(),
}));

vi.mock("virtual:pwa-register/react", () => ({
  useRegisterSW: () => ({
    offlineReady: [serviceWorker.offlineReady, serviceWorker.setOfflineReady],
    needRefresh: [serviceWorker.needRefresh, serviceWorker.setNeedRefresh],
    updateServiceWorker: serviceWorker.updateServiceWorker,
  }),
}));

let online = true;

beforeEach(() => {
  vi.restoreAllMocks();
  online = true;
  vi.spyOn(navigator, "onLine", "get").mockImplementation(() => online);
  serviceWorker.offlineReady = false;
  serviceWorker.needRefresh = false;
  serviceWorker.setOfflineReady.mockReset();
  serviceWorker.setNeedRefresh.mockReset();
  serviceWorker.updateServiceWorker.mockReset().mockResolvedValue(undefined);
});

describe("app connectivity and updates", () => {
  it("responds to offline and online browser events without claiming offline readiness", () => {
    render(<AppStatus />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    online = false;
    act(() => { window.dispatchEvent(new Event("offline")); });
    expect(screen.getByRole("status")).toHaveTextContent("You’re offline. Keep creating in your local workspace.");

    online = true;
    act(() => { window.dispatchEvent(new Event("online")); });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(serviceWorker.setOfflineReady).not.toHaveBeenCalled();
  });

  it("activates an available update on request and prevents duplicate clicks while updating", async () => {
    const user = userEvent.setup();
    serviceWorker.needRefresh = true;
    let finishUpdate!: () => void;
    serviceWorker.updateServiceWorker.mockReturnValue(new Promise<void>(resolve => { finishUpdate = resolve; }));
    render(<AppStatus />);

    expect(serviceWorker.updateServiceWorker).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Update app" }));
    expect(serviceWorker.updateServiceWorker).toHaveBeenCalledExactlyOnceWith(true);
    expect(screen.getByRole("button", { name: "Updating…" })).toBeDisabled();

    await act(async () => { finishUpdate(); });
    expect(screen.getByRole("button", { name: "Update app" })).toBeEnabled();
  });

  it("shows a failed update and allows a successful retry", async () => {
    const user = userEvent.setup();
    serviceWorker.needRefresh = true;
    serviceWorker.updateServiceWorker
      .mockRejectedValueOnce(new Error("Network unavailable"))
      .mockResolvedValueOnce(undefined);
    render(<AppStatus />);

    await user.click(screen.getByRole("button", { name: "Update app" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Update couldn't finish. Try again when connected.");
    expect(screen.getByRole("button", { name: "Update app" })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: "Update app" }));
    expect(serviceWorker.updateServiceWorker).toHaveBeenCalledTimes(2);
    expect(serviceWorker.updateServiceWorker).toHaveBeenLastCalledWith(true);
    expect(screen.getByRole("status")).toHaveTextContent("A fresh version of Armory is ready.");
  });

  it("defers an available update when its notice is dismissed", async () => {
    const user = userEvent.setup();
    serviceWorker.needRefresh = true;
    render(<AppStatus />);

    await user.click(screen.getByRole("button", { name: "Dismiss app update" }));
    expect(serviceWorker.setNeedRefresh).toHaveBeenCalledExactlyOnceWith(false);
    expect(serviceWorker.updateServiceWorker).not.toHaveBeenCalled();
  });

  it("shows and dismisses the offline-ready notice only when the service worker reports readiness", async () => {
    const user = userEvent.setup();
    serviceWorker.offlineReady = true;
    render(<AppStatus />);
    expect(screen.getByRole("status")).toHaveTextContent("Armory is available offline.");

    await user.click(screen.getByRole("button", { name: "Dismiss offline readiness notice" }));
    expect(serviceWorker.setOfflineReady).toHaveBeenCalledExactlyOnceWith(false);
    expect(serviceWorker.updateServiceWorker).not.toHaveBeenCalled();
  });
});
