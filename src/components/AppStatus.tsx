import { useEffect, useState } from "react";
import { Check, RefreshCw, WifiOff, X } from "lucide-react";
import { useRegisterSW } from "virtual:pwa-register/react";

/** Production-only caching and update prompts; development stays uncached. */
export default function AppStatus() {
  const [online, setOnline] = useState(navigator.onLine);
  const [registrationFailed, setRegistrationFailed] = useState(false);
  const [updateFailed, setUpdateFailed] = useState(false);
  const [updating, setUpdating] = useState(false);
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError() {
      setRegistrationFailed(true);
    },
  });

  useEffect(() => {
    const sync = () => setOnline(navigator.onLine);
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  useEffect(() => {
    if (!offlineReady) return;
    const timer = setTimeout(() => setOfflineReady(false), 6000);
    return () => clearTimeout(timer);
  }, [offlineReady, setOfflineReady]);

  async function update() {
    setUpdating(true);
    setUpdateFailed(false);
    try {
      await updateServiceWorker(true);
    } catch {
      setUpdateFailed(true);
    } finally {
      setUpdating(false);
    }
  }

  if (!online)
    return (
      <div className="app-status offline-status" role="status">
        <WifiOff size={15} />
        <span>You’re offline. Keep creating in your local workspace.</span>
      </div>
    );
  if (needRefresh)
    return (
      <div className="app-status" role="status">
        <RefreshCw size={16} />
        <span>
          {updateFailed
            ? "Update couldn't finish. Try again when connected."
            : "A fresh version of Armory is ready."}
        </span>
        <button className="status-action" disabled={updating} onClick={update}>
          {updating ? "Updating…" : "Update app"}
        </button>
        <button
          className="icon-button"
          aria-label="Dismiss app update"
          onClick={() => setNeedRefresh(false)}
        >
          <X size={15} />
        </button>
      </div>
    );
  if (registrationFailed)
    return (
      <div className="app-status" role="status">
        <WifiOff size={16} />
        <span>Offline setup wasn’t completed. Reopen online to retry.</span>
        <button
          className="icon-button"
          aria-label="Dismiss offline setup notice"
          onClick={() => setRegistrationFailed(false)}
        >
          <X size={15} />
        </button>
      </div>
    );
  if (offlineReady)
    return (
      <div className="app-status" role="status">
        <Check size={16} />
        <span>Ready for the next adventure. Armory is available offline.</span>
        <button
          className="icon-button"
          aria-label="Dismiss offline readiness notice"
          onClick={() => setOfflineReady(false)}
        >
          <X size={15} />
        </button>
      </div>
    );
  return null;
}
