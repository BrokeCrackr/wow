import { useEffect, useRef, useState } from "react";
import {
  Check,
  Download,
  MonitorSmartphone,
  Share,
  Smartphone,
  X,
} from "lucide-react";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function inAppMode() {
  return Boolean(
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone,
  );
}

export default function InstallApp() {
  const [installed, setInstalled] = useState(inAppMode);
  const [deferredPrompt, setDeferredPrompt] =
    useState<InstallPromptEvent | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [platform, setPlatform] = useState<"apple" | "other">(() =>
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
      ? "apple"
      : "other",
  );
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const media = window.matchMedia?.("(display-mode: standalone)");
    const syncDisplayMode = () => setInstalled(inAppMode());
    const onInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as InstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
      setOpen(false);
    };
    media?.addEventListener?.("change", syncDisplayMode);
    window.addEventListener("beforeinstallprompt", onInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      media?.removeEventListener?.("change", syncDisplayMode);
      window.removeEventListener("beforeinstallprompt", onInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  useEffect(() => {
    if (open) dialog.current?.showModal();
    else dialog.current?.close();
  }, [open]);

  async function requestInstall() {
    if (!deferredPrompt || busy) return;
    const event = deferredPrompt;
    setBusy(true);
    setDeferredPrompt(null);
    try {
      await event.prompt();
      const choice = await event.userChoice;
      setMessage(
        choice.outcome === "accepted"
          ? "Installation requested. Your browser will finish adding Armory to your device."
          : "You can install later. Your character is still available in this browser.",
      );
    } catch {
      setMessage(
        "The install prompt couldn't open. You can use your browser's install menu below.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (installed)
    return (
      <span className="install-mode">
        <Check size={13} />
        App installed
      </span>
    );

  return (
    <div className="install-control">
      <button
        className="install-launch"
        onClick={() => {
          setMessage("");
          setOpen(true);
        }}
      >
        <Download size={14} />
        {deferredPrompt ? "Install app" : "Get app"}
      </button>
      <dialog
        className="modal install-modal"
        ref={dialog}
        aria-labelledby="install-title"
        aria-describedby="install-description"
        onCancel={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setOpen(false);
        }}
      >
        <div className="modal-content">
          <button
            className="icon-button modal-close"
            aria-label="Close install guide"
            onClick={() => setOpen(false)}
          >
            <X size={20} />
          </button>
          <span className="modal-icon">
            <MonitorSmartphone size={25} />
          </span>
          <p className="eyebrow">YOUR ADVENTURE, TO GO</p>
          <h2 id="install-title">Make room for a legend.</h2>
          <p id="install-description">
            Add Armory to your home screen or desktop. Launch it in its own
            window and keep creating offline after your first online visit.
          </p>
          {(deferredPrompt || busy) && (
            <button
              className="button primary install-native"
              onClick={requestInstall}
              disabled={busy}
            >
              <Download size={16} />
              {busy ? "Requesting install…" : "Install Armory"}
            </button>
          )}
          {message && (
            <p className="install-message" role="status">
              {message}
            </p>
          )}
          <div
            className="install-platforms"
            role="group"
            aria-label="Installation platform"
          >
            <button
              aria-pressed={platform === "other"}
              onClick={() => setPlatform("other")}
            >
              <MonitorSmartphone size={14} />
              Android / desktop
            </button>
            <button
              aria-pressed={platform === "apple"}
              onClick={() => setPlatform("apple")}
            >
              <Smartphone size={14} />
              iPhone / iPad
            </button>
          </div>
          <ol className="guide-steps install-steps">
            {platform === "apple" ? (
              <>
                <li>
                  <span>01</span>
                  <div>
                    <h3>Open Armory in Safari</h3>
                    <p>Visit the hosted app using its secure HTTPS address.</p>
                  </div>
                </li>
                <li>
                  <span>02</span>
                  <div>
                    <h3>
                      Share a little magic <Share size={13} />
                    </h3>
                    <p>
                      Tap Safari’s Share button, then choose Add to Home Screen.
                    </p>
                  </div>
                </li>
                <li>
                  <span>03</span>
                  <div>
                    <h3>Make it yours</h3>
                    <p>
                      Confirm Add, then launch Armory from your home screen.
                    </p>
                  </div>
                </li>
              </>
            ) : (
              <>
                <li>
                  <span>01</span>
                  <div>
                    <h3>Open Armory in Chrome or Edge</h3>
                    <p>Visit the hosted app using its secure HTTPS address.</p>
                  </div>
                </li>
                <li>
                  <span>02</span>
                  <div>
                    <h3>Add it to your apps</h3>
                    <p>
                      Use Install app above when available, or choose Install
                      app or Add to Home screen in your browser’s menu.
                    </p>
                  </div>
                </li>
                <li>
                  <span>03</span>
                  <div>
                    <h3>Start your next adventure</h3>
                    <p>
                      Confirm Install, then find Armory in your app launcher or
                      on your desktop.
                    </p>
                  </div>
                </li>
              </>
            )}
          </ol>
          {platform === "other" && (
            <p className="install-safari-note">
              Using Safari on a Mac? Choose File → Add to Dock.
            </p>
          )}
          <div className="info-note">
            <Smartphone size={18} />
            <p>
              Presets stay on this device and browser. Export important
              characters as a backup. Open Armory online once to prepare offline
              access.
            </p>
          </div>
        </div>
      </dialog>
    </div>
  );
}
