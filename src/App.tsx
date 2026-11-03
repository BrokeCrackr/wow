import { useEffect, useRef, useState } from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  CircleHelp,
  Crosshair,
  Gem,
  Heart,
  Layers3,
  Leaf,
  Menu,
  Minus,
  Mountain,
  Plus,
  RotateCcw,
  Save,
  Search,
  Shield,
  Sparkles,
  Sword,
  Swords,
  Trash2,
  UserRound,
  WandSparkles,
  Wind,
  X,
} from "lucide-react";
import CharacterPortrait from "./components/CharacterPortrait";
import CinematicPortrait from "./components/CinematicPortrait";
import InstallApp from "./components/InstallApp";
import {
  armorColors,
  classes,
  defaultCharacter,
  gearItems,
  hairColors,
  hairStyles,
  races,
  skinColors,
  starterPresets,
} from "./data";
import type { Character } from "./data";

type Preset = {
  id: string;
  name: string;
  description: string;
  character: Character;
};
type Tab = "Identity" | "Appearance" | "Equipment";
const CHARACTER_KEY = "armory-character-v1";
const PRESETS_KEY = "armory-presets-v1";
const icons = {
  Warrior: Swords,
  Mage: WandSparkles,
  Rogue: Sword,
  Paladin: Shield,
  Hunter: Crosshair,
  Druid: Leaf,
};
const slots = ["Head", "Shoulders", "Chest", "Weapon"] as const;

function isCharacter(value: unknown): value is Character {
  if (!value || typeof value !== "object") return false;
  const c = value as Character;
  return (
    typeof c.name === "string" &&
    c.name.trim().length > 0 &&
    c.name.length <= 24 &&
    races.some((r) => r.name === c.race) &&
    classes.some((cl) => cl.name === c.className) &&
    [c.armorColor, c.hairColor, c.skinColor].every(
      (v) => typeof v === "string" && /^#[\da-f]{6}$/i.test(v),
    ) &&
    hairStyles.includes(c.hairStyle) &&
    typeof c.glow === "boolean" &&
    Array.isArray(c.equipment) &&
    c.equipment.length <= 4 &&
    c.equipment.every((id) => gearItems.some((item) => item.id === id)) &&
    new Set(
      c.equipment.map((id) => gearItems.find((item) => item.id === id)!.slot),
    ).size === c.equipment.length
  );
}

function readCharacter(): Character {
  try {
    const value: unknown = JSON.parse(
      localStorage.getItem(CHARACTER_KEY) || "null",
    );
    return isCharacter(value) ? value : structuredClone(defaultCharacter);
  } catch {
    return structuredClone(defaultCharacter);
  }
}

function readPresets(): Preset[] {
  try {
    const value: unknown = JSON.parse(
      localStorage.getItem(PRESETS_KEY) || "null",
    );
    if (!Array.isArray(value)) return [];
    return value
      .filter(
        (p): p is Preset =>
          !!p &&
          typeof p === "object" &&
          typeof p.id === "string" &&
          typeof p.name === "string" &&
          p.name.length <= 40 &&
          typeof p.description === "string" &&
          isCharacter(p.character),
      )
      .slice(0, 50);
  } catch {
    return [];
  }
}

function App() {
  const [character, setCharacter] = useState<Character>(readCharacter);
  const [presets, setPresets] = useState<Preset[]>(readPresets);
  const [tab, setTab] = useState<Tab>("Identity");
  const [page, setPage] = useState<"studio" | "collection">("studio");
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [previewMode, setPreviewMode] = useState<"cinematic" | "live">(
    "cinematic",
  );
  const [saved, setSaved] = useState(false);
  const [saveDialog, setSaveDialog] = useState(false);
  const [guideDialog, setGuideDialog] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [toast, setToast] = useState("");
  const [query, setQuery] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const saveRef = useRef<HTMLDialogElement>(null);
  const guideRef = useRef<HTMLDialogElement>(null);
  const currentClass = classes.find((c) => c.name === character.className)!;
  const currentRace = races.find((r) => r.name === character.race)!;
  const equipped = gearItems.filter((item) =>
    character.equipment.includes(item.id),
  );
  const itemLevel = equipped.length
    ? Math.round(equipped.reduce((sum, i) => sum + i.level, 0) / slots.length)
    : 0;
  const stats = Object.entries(currentClass.baseStats).map(([key, base]) => ({
    key,
    value:
      base +
      equipped.reduce(
        (sum, item) => sum + item.stats[key as keyof typeof item.stats],
        0,
      ),
  }));

  useEffect(() => {
    try {
      localStorage.setItem(CHARACTER_KEY, JSON.stringify(character));
    } catch {
      /* The session still works without storage. */
    }
  }, [character]);
  useEffect(() => () => clearTimeout(toastTimer.current), []);
  useEffect(() => {
    if (saveDialog) saveRef.current?.showModal();
    else saveRef.current?.close();
  }, [saveDialog]);
  useEffect(() => {
    if (guideDialog) guideRef.current?.showModal();
    else guideRef.current?.close();
  }, [guideDialog]);

  function notify(message: string) {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 4500);
  }
  function update<K extends keyof Character>(key: K, value: Character[K]) {
    setCharacter((c) => ({ ...c, [key]: value }));
    setSaved(false);
  }
  function loadPreset(preset: Preset) {
    setCharacter(structuredClone(preset.character));
    setRotation(0);
    setSaved(false);
    setPage("studio");
    notify(`${preset.name} loaded into the studio`);
  }
  function persistPresets(next: Preset[]) {
    try {
      localStorage.setItem(PRESETS_KEY, JSON.stringify(next));
      setPresets(next);
      return true;
    } catch {
      notify(
        "Browser storage is unavailable. Export your character to keep it.",
      );
      return false;
    }
  }
  function savePreset(event: React.FormEvent) {
    event.preventDefault();
    if (!presetName.trim()) return;
    if (presets.length >= 50) {
      notify("Your collection is full. Delete a preset to make room.");
      return;
    }
    const preset: Preset = {
      id: crypto.randomUUID(),
      name: presetName.trim(),
      description: `${character.race} · ${character.className}`,
      character: structuredClone(character),
    };
    if (persistPresets([preset, ...presets])) {
      setSaveDialog(false);
      setSaved(true);
      notify("Preset saved to your collection");
    }
  }
  function exportCharacter() {
    const blob = new Blob(
      [JSON.stringify({ version: 1, character }, null, 2)],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${
      character.name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-") || "character"
    }-armory.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify("Character exported as JSON");
  }
  function equip(id: string) {
    const item = gearItems.find((i) => i.id === id)!;
    const remaining = character.equipment.filter(
      (existing) =>
        gearItems.find((i) => i.id === existing)!.slot !== item.slot,
    );
    update(
      "equipment",
      character.equipment.includes(id) ? remaining : [...remaining, id],
    );
  }
  function navigate(next: "studio" | "collection") {
    setPage(next);
    setMobileNav(false);
  }
  function openSave() {
    setPresetName(`${character.name}'s ${character.className}`);
    setSaveDialog(true);
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? "is-open" : ""}`}>
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate("studio");
          }}
          aria-label="Armory home"
        >
          <span className="brand-mark">
            <Shield size={28} strokeWidth={1.3} />
            <span>A</span>
          </span>
          <span>
            ARMORY<span className="brand-caption">CHARACTER ATELIER</span>
          </span>
        </a>
        <p className="nav-label">YOUR WORKSPACE</p>
        <nav aria-label="Main navigation">
          <button
            className={`nav-item ${page === "studio" ? "active" : ""}`}
            onClick={() => navigate("studio")}
          >
            <UserRound size={18} />
            Character studio
            <span className="nav-dot" />
          </button>
          <button
            className={`nav-item ${page === "collection" ? "active" : ""}`}
            onClick={() => navigate("collection")}
          >
            <Layers3 size={18} />
            My collection<span className="nav-count">{presets.length}</span>
          </button>
          <button
            className="nav-item"
            onClick={() => {
              setGuideDialog(true);
              setMobileNav(false);
            }}
          >
            <BookOpen size={18} />
            Field guide
            <ArrowRight size={14} className="nav-arrow" />
          </button>
        </nav>
        <div className="sidebar-bottom">
          <div className="adventure-card">
            <Mountain size={40} strokeWidth={1} />
            <span>
              Every legend
              <br />
              starts with you.
            </span>
            <p>
              Find your look.
              <br />
              Make your mark on Azeroth.
            </p>
            <span className="adventure-line" />
          </div>
          <div className="local-status">
            <span /> LOCAL WORKSPACE
            <button
              className="status-help"
              aria-label="About the local workspace"
              onClick={() => setGuideDialog(true)}
            >
              <CircleHelp size={13} />
            </button>
          </div>
          <p className="fan-note">
            A fan-made creative tool.
            <br />
            Not affiliated with Blizzard Entertainment.
          </p>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div className="breadcrumbs">
            <button
              className="mobile-menu icon-button"
              aria-label="Toggle navigation"
              onClick={() => setMobileNav(!mobileNav)}
            >
              <Menu size={20} />
            </button>
            <span>Workspace</span>
            <ChevronRight size={13} />
            <strong>
              {page === "studio" ? "Character studio" : "My collection"}
            </strong>
          </div>
          <div className="workspace-user">
            <span className="connection-dot" />
            <span>Local character workspace</span>
            <InstallApp />
            <span className="user-avatar">A</span>
          </div>
        </header>

        <section className="page-intro">
          <div>
            <p className="eyebrow">
              <span /> CRAFT YOUR NEXT LEGEND
            </p>
            <h1>
              {page === "studio" ? "Character atelier" : "Your collection"}
            </h1>
            <p className="page-subtitle">
              {page === "studio"
                ? "A new look. An untold story. A character that’s uniquely yours."
                : "Your favorite identities, ready for the next adventure."}
            </p>
          </div>
          <div className="page-actions">
            {page === "studio" && (
              <button
                className="button subtle"
                onClick={() => {
                  setCharacter(structuredClone(defaultCharacter));
                  setRotation(0);
                  setZoom(1);
                  setSaved(false);
                  notify("Character restored to the starting look");
                }}
              >
                <RotateCcw size={15} />
                Reset
              </button>
            )}
            <button className="button primary" onClick={openSave}>
              {saved ? <Check size={16} /> : <Save size={16} />}
              {saved ? "Preset saved" : "Save preset"}
            </button>
          </div>
        </section>

        {page === "studio" ? (
          <>
            <div className="studio-grid">
              <section
                className="panel config-panel"
                aria-label="Character customization"
              >
                <div className="panel-heading">
                  <div>
                    <span className="section-kicker">
                      THE DETAILS MAKE THE HERO
                    </span>
                    <h2>Make it yours</h2>
                  </div>
                  <Sparkles size={20} strokeWidth={1.5} />
                </div>
                <div
                  className="tabs"
                  role="tablist"
                  aria-label="Customization category"
                >
                  {(["Identity", "Appearance", "Equipment"] as Tab[]).map(
                    (label) => (
                      <button
                        key={label}
                        role="tab"
                        aria-selected={tab === label}
                        id={`tab-${label}`}
                        aria-controls={`panel-${label}`}
                        tabIndex={tab === label ? 0 : -1}
                        onKeyDown={(e) => {
                          const tabs: Tab[] = [
                            "Identity",
                            "Appearance",
                            "Equipment",
                          ];
                          const index = tabs.indexOf(label);
                          const next =
                            e.key === "ArrowRight"
                              ? (index + 1) % 3
                              : e.key === "ArrowLeft"
                                ? (index + 2) % 3
                                : e.key === "Home"
                                  ? 0
                                  : e.key === "End"
                                    ? 2
                                    : -1;
                          if (next !== -1) {
                            e.preventDefault();
                            setTab(tabs[next]);
                            document
                              .getElementById(`tab-${tabs[next]}`)
                              ?.focus();
                          }
                        }}
                        onClick={() => setTab(label)}
                      >
                        {label}
                      </button>
                    ),
                  )}
                </div>
                <div
                  className="config-body"
                  role="tabpanel"
                  id={`panel-${tab}`}
                  aria-labelledby={`tab-${tab}`}
                >
                  {tab === "Identity" && (
                    <>
                      <label className="field-label" htmlFor="character-name">
                        CHARACTER NAME<span>01</span>
                      </label>
                      <div className="name-input">
                        <input
                          id="character-name"
                          value={character.name}
                          maxLength={24}
                          onChange={(e) => update("name", e.target.value)}
                          onBlur={() => {
                            if (!character.name.trim())
                              update("name", "Adventurer");
                          }}
                        />
                        <UserRound size={15} />
                      </div>
                      <div className="field-label">
                        CHOOSE YOUR RACE<span>02</span>
                      </div>
                      <div className="race-grid">
                        {races.map((race) => (
                          <button
                            key={race.id}
                            className={`race-option ${character.race === race.name ? "selected" : ""}`}
                            aria-pressed={character.race === race.name}
                            onClick={() => update("race", race.name)}
                          >
                            <span
                              className={`race-symbol race-${race.id}`}
                              aria-hidden="true"
                            >
                              <RaceSymbol name={race.name} />
                              <span className="race-thumbnail" />
                            </span>
                            <span>{race.name}</span>
                            {character.race === race.name && (
                              <span className="selection-tick">
                                <Check size={10} />
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                      <div className="race-detail">
                        <span
                          className={`faction-icon ${currentRace.faction.toLowerCase()}`}
                        >
                          <Shield size={14} />
                        </span>
                        <div>
                          <strong>{currentRace.faction}</strong>
                          <span>{currentRace.bonus}</span>
                        </div>
                      </div>
                      <div className="field-label class-label">
                        CHOOSE YOUR CLASS<span>03</span>
                      </div>
                      <div className="class-grid">
                        {classes.map((option) => {
                          const Icon =
                            icons[option.name as keyof typeof icons] || Sword;
                          return (
                            <button
                              key={option.id}
                              className={`class-option ${character.className === option.name ? "selected" : ""}`}
                              style={
                                {
                                  "--class-color": option.color,
                                } as React.CSSProperties
                              }
                              aria-pressed={character.className === option.name}
                              onClick={() => update("className", option.name)}
                            >
                              <Icon size={19} strokeWidth={1.4} />
                              {option.name}
                            </button>
                          );
                        })}
                      </div>
                      <div className="class-description">
                        <span style={{ background: currentClass.color }} />
                        <p>
                          <strong>{currentClass.role}</strong>
                          {currentClass.description}
                        </p>
                      </div>
                    </>
                  )}
                  {tab === "Appearance" && (
                    <>
                      <ColorPicker
                        title="Armor palette"
                        colors={armorColors}
                        selected={character.armorColor}
                        onSelect={(v) => update("armorColor", v)}
                      />
                      <ColorPicker
                        title="Hair color"
                        colors={hairColors}
                        selected={character.hairColor}
                        onSelect={(v) => update("hairColor", v)}
                      />
                      <ColorPicker
                        title="Skin tone"
                        colors={skinColors}
                        selected={character.skinColor}
                        onSelect={(v) => update("skinColor", v)}
                      />
                      <div className="field-label">HAIR STYLE</div>
                      <div className="hairstyles">
                        {hairStyles.map((style) => (
                          <button
                            key={style}
                            aria-pressed={character.hairStyle === style}
                            className={
                              character.hairStyle === style ? "selected" : ""
                            }
                            onClick={() => update("hairStyle", style)}
                          >
                            {style}
                          </button>
                        ))}
                      </div>
                      <div className="glow-control">
                        <div>
                          <strong>Arcane glow</strong>
                          <p>A little magic goes a long way.</p>
                        </div>
                        <button
                          className={`switch ${character.glow ? "on" : ""}`}
                          role="switch"
                          aria-checked={character.glow}
                          aria-label="Arcane glow"
                          onClick={() => update("glow", !character.glow)}
                        >
                          <span />
                        </button>
                      </div>
                      <div className="info-note">
                        <Sparkles size={16} />
                        {previewMode === "cinematic" ? (
                          <div>
                            <p>
                              Switch to Live Customisation to preview colors,
                              hair and gear.
                            </p>
                            <button
                              className="preview-changes"
                              onClick={() => setPreviewMode("live")}
                            >
                              Preview changes <ArrowRight size={12} />
                            </button>
                          </div>
                        ) : (
                          <p>
                            Every detail updates your character preview
                            instantly.
                          </p>
                        )}
                      </div>
                    </>
                  )}
                  {tab === "Equipment" && (
                    <>
                      <p className="equipment-intro">
                        Build your signature set. Select a piece to equip it;
                        select it again to remove it.
                        {previewMode === "cinematic" && (
                          <button
                            className="preview-changes"
                            onClick={() => setPreviewMode("live")}
                          >
                            Preview gear in live view <ArrowRight size={12} />
                          </button>
                        )}
                      </p>
                      {slots.map((slot) => (
                        <div className="gear-slot" key={slot}>
                          <div className="field-label">
                            {slot.toUpperCase()}
                            <span>
                              {character.equipment.some(
                                (id) =>
                                  gearItems.find((i) => i.id === id)?.slot ===
                                  slot,
                              )
                                ? "1 / 1"
                                : "0 / 1"}
                            </span>
                          </div>
                          <div className="gear-list">
                            {gearItems
                              .filter((i) => i.slot === slot)
                              .map((item) => (
                                <button
                                  key={item.id}
                                  className={`gear-option ${character.equipment.includes(item.id) ? "selected" : ""}`}
                                  onClick={() => equip(item.id)}
                                  aria-pressed={character.equipment.includes(
                                    item.id,
                                  )}
                                >
                                  <span
                                    className={`gear-icon ${item.rarity.toLowerCase()}`}
                                  >
                                    {slot === "Weapon" ? (
                                      <Sword size={18} />
                                    ) : slot === "Head" ? (
                                      <Gem size={18} />
                                    ) : (
                                      <Shield size={18} />
                                    )}
                                  </span>
                                  <span>
                                    <strong>{item.name}</strong>
                                    <small>
                                      {item.rarity} · ilvl {item.level}
                                    </small>
                                  </span>
                                  {character.equipment.includes(item.id) && (
                                    <Check size={14} />
                                  )}
                                </button>
                              ))}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
                <div className="config-footer">
                  <span className="tiny-diamond" /> YOUR STORY. YOUR RULES.
                </div>
              </section>

              <section
                className={`panel portrait-panel ${previewMode === "cinematic" ? "is-cinematic" : "is-live"}`}
                aria-label="Character preview"
              >
                <div className="portrait-topline">
                  <span className="preview-label">
                    <span />{" "}
                    {previewMode === "cinematic"
                      ? "CINEMATIC PORTRAIT"
                      : "LIVE PREVIEW"}
                  </span>
                  <span className="level-badge">
                    LVL <strong>80</strong>
                  </span>
                </div>
                <div
                  className="preview-mode-switch"
                  role="group"
                  aria-label="Character preview mode"
                >
                  <button
                    aria-pressed={previewMode === "cinematic"}
                    onClick={() => setPreviewMode("cinematic")}
                  >
                    HD Portrait
                  </button>
                  <button
                    aria-pressed={previewMode === "live"}
                    onClick={() => setPreviewMode("live")}
                  >
                    Live Customisation
                  </button>
                </div>
                <div className="portrait-radial" />
                <div className="portrait-grid" />
                <span className="portrait-ornament left" />
                <span className="portrait-ornament right" />
                <div
                  className="portrait-art"
                  style={{ transform: `scale(${zoom})` }}
                >
                  {previewMode === "cinematic" ? (
                    <CinematicPortrait
                      race={character.race}
                      onSwitchToLive={() => setPreviewMode("live")}
                    />
                  ) : (
                    <CharacterPortrait {...character} rotation={rotation} />
                  )}
                </div>
                <div className="portrait-vignette" />
                <div className="character-caption">
                  <span className="character-faction">
                    {currentRace.faction.toUpperCase()}
                    <span />
                    {character.className.toUpperCase()}
                  </span>
                  <h2>{character.name || "Adventurer"}</h2>
                  <p>
                    Level 80 {character.race} {character.className}
                  </p>
                </div>
                <div className="portrait-toolbar">
                  {previewMode === "live" && (
                    <button
                      className="icon-button"
                      title="Turn left"
                      aria-label="Turn character left"
                      onClick={() => setRotation((v) => Math.max(-30, v - 10))}
                      disabled={rotation <= -30}
                    >
                      <RotateCcw size={15} />
                    </button>
                  )}
                  {previewMode === "live" && (
                    <span className="toolbar-divider" />
                  )}
                  <span className="view-label">
                    {previewMode === "cinematic"
                      ? "PORTRAIT ZOOM"
                      : "CHARACTER VIEW"}
                  </span>
                  <span className="toolbar-divider" />
                  <button
                    className="icon-button"
                    title="Zoom out"
                    aria-label="Zoom out"
                    onClick={() =>
                      setZoom((z) => Math.max(0.85, +(z - 0.1).toFixed(2)))
                    }
                    disabled={zoom <= 0.85}
                  >
                    <Minus size={16} />
                  </button>
                  <button
                    className="icon-button"
                    title="Zoom in"
                    aria-label="Zoom in"
                    onClick={() =>
                      setZoom((z) => Math.min(1.25, +(z + 0.1).toFixed(2)))
                    }
                    disabled={zoom >= 1.25}
                  >
                    <Plus size={16} />
                  </button>
                  {previewMode === "live" && (
                    <button
                      className="icon-button"
                      title="Turn right"
                      aria-label="Turn character right"
                      onClick={() => setRotation((v) => Math.min(30, v + 10))}
                      disabled={rotation >= 30}
                    >
                      <RotateCcw size={15} className="flip" />
                    </button>
                  )}
                </div>
                <p className="preview-disclaimer">
                  {previewMode === "cinematic" ? (
                    <>
                      CINEMATIC RACE ARTWORK
                      <span className="preview-note-detail">
                        Use Live Customisation for gear &amp; appearance
                      </span>
                    </>
                  ) : (
                    "STYLISED PREVIEW · NOT IN-GAME RENDERING"
                  )}
                </p>
              </section>

              <aside className="details-column">
                <section className="panel stats-panel">
                  <div className="small-panel-heading">
                    <h2>Character overview</h2>
                    <Shield size={16} />
                  </div>
                  <div className="item-level">
                    <div className="level-gem">
                      <Gem size={24} strokeWidth={1.2} />
                    </div>
                    <div>
                      <span>ITEM LEVEL</span>
                      <strong data-testid="item-level">
                        {itemLevel}
                        <small> / 645</small>
                      </strong>
                    </div>
                    <span className="gear-count">
                      {equipped.length}/4
                      <br />
                      <small>equipped</small>
                    </span>
                  </div>
                  <div className="stat-divider" />
                  <div className="stats-list">
                    {stats.map(({ key, value }) => {
                      const Icon =
                        key === "strength"
                          ? Swords
                          : key === "agility"
                            ? Wind
                            : key === "intellect"
                              ? Sparkles
                              : Heart;
                      return (
                        <div className="stat" key={key}>
                          <div className="stat-info">
                            <span>
                              <Icon size={14} />
                              {key}
                            </span>
                            <strong data-testid={`stat-${key}`}>
                              {value.toLocaleString()}
                            </strong>
                          </div>
                          <div className={`stat-bar ${key}`}>
                            <span
                              style={{ width: `${Math.min(100, value / 16)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="stat-note">
                    Preview stats based on class and equipped gear.
                  </p>
                </section>
                <section className="panel build-panel">
                  <div className="small-panel-heading">
                    <h2>A little inspiration</h2>
                    <Sparkles size={16} />
                  </div>
                  <p className="panel-description">
                    Borrow a look. Make it your own.
                  </p>
                  <div className="inspiration-list">
                    {starterPresets.map((preset, i) => (
                      <button
                        key={preset.id}
                        className="inspiration-item"
                        onClick={() => loadPreset(preset)}
                      >
                        <span className={`preset-art art-${i}`}>
                          <MiniEmblem type={preset.character.className} />
                        </span>
                        <span>
                          <strong>{preset.name}</strong>
                          <small>{preset.description}</small>
                        </span>
                        <ChevronRight size={15} />
                      </button>
                    ))}
                  </div>
                  <button
                    className="collection-link"
                    onClick={() => setPage("collection")}
                  >
                    View my collection
                    <ArrowRight size={14} />
                  </button>
                </section>
                <button className="export-button" onClick={exportCharacter}>
                  <ArrowDownToLine size={16} />
                  <span>
                    Export character<small>Keep a copy of your creation</small>
                  </span>
                  <ChevronRight size={14} />
                </button>
              </aside>
            </div>
            <div className="studio-bottom">
              <span>
                <span className="connection-dot" />A space for your imagination.
                No account needed.
              </span>
              <button onClick={() => setGuideDialog(true)}>
                New to the atelier?
                <ArrowUpRightIcon />
              </button>
            </div>
          </>
        ) : (
          <section className="collection-page">
            <div className="collection-heading">
              <div>
                <h2>
                  Saved presets <span>{presets.length}</span>
                </h2>
                <p>
                  Stored in this browser. Export characters to keep a portable
                  copy.
                </p>
              </div>
              <div className="search-input">
                <Search size={16} />
                <input
                  aria-label="Search saved presets"
                  placeholder="Find a character…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>
            {presets.length === 0 ? (
              <div className="empty-state">
                <Layers3 size={40} strokeWidth={1} />
                <h3>Your next legend belongs here.</h3>
                <p>Create a look in the studio, then save it as a preset.</p>
                <button
                  className="button primary"
                  onClick={() => setPage("studio")}
                >
                  Open character studio
                  <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <div className="saved-grid">
                {presets
                  .filter((p) =>
                    `${p.name} ${p.description}`
                      .toLowerCase()
                      .includes(query.toLowerCase()),
                  )
                  .map((preset) => (
                    <article className="panel saved-card" key={preset.id}>
                      <div
                        className="saved-portrait"
                        style={
                          {
                            "--preset-color": preset.character.armorColor,
                          } as React.CSSProperties
                        }
                      >
                        <CharacterPortrait {...preset.character} rotation={0} />
                      </div>
                      <div className="saved-card-body">
                        <span className="section-kicker">
                          {preset.character.race} · {preset.character.className}
                        </span>
                        <h3>{preset.name}</h3>
                        <div>
                          <button
                            className="button subtle"
                            onClick={() => loadPreset(preset)}
                          >
                            Load character
                            <ArrowRight size={14} />
                          </button>
                          <button
                            className="icon-button delete-button"
                            aria-label={`Delete ${preset.name}`}
                            onClick={() => {
                              if (
                                persistPresets(
                                  presets.filter((p) => p.id !== preset.id),
                                )
                              )
                                notify("Preset removed from your collection");
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                {presets.filter((p) =>
                  `${p.name} ${p.description}`
                    .toLowerCase()
                    .includes(query.toLowerCase()),
                ).length === 0 && (
                  <div className="no-results">
                    No presets match “{query}”. Try another name.
                  </div>
                )}
              </div>
            )}
            <div className="collection-starters">
              <span className="eyebrow">A GOOD PLACE TO START</span>
              <h2>Stories waiting to be told</h2>
              <div className="starter-grid">
                {starterPresets.map((preset, i) => (
                  <button
                    className="panel starter-card"
                    key={preset.id}
                    onClick={() => loadPreset(preset)}
                  >
                    <span className={`preset-art art-${i}`}>
                      <MiniEmblem type={preset.character.className} />
                    </span>
                    <span>
                      <strong>{preset.name}</strong>
                      <small>{preset.description}</small>
                    </span>
                    <ArrowRight size={18} />
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}
        <footer className="page-footer">
          <span>
            ARMORY <span>·</span> CHARACTER ATELIER
          </span>
          <span>Made for the heroes of Azeroth.</span>
        </footer>
      </main>

      <dialog
        ref={saveRef}
        className="modal"
        aria-labelledby="save-title"
        onCancel={() => setSaveDialog(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setSaveDialog(false);
        }}
      >
        <div className="modal-content">
          <button
            className="icon-button modal-close"
            aria-label="Close save dialog"
            onClick={() => setSaveDialog(false)}
          >
            <X size={20} />
          </button>
          <span className="modal-icon">
            <Save size={24} />
          </span>
          <p className="eyebrow">ONE FOR THE COLLECTION</p>
          <h2 id="save-title">Remember this legend.</h2>
          <p>
            Save your character’s identity, appearance, and equipment as a
            preset in this browser.
          </p>
          <form onSubmit={savePreset}>
            <label htmlFor="preset-name" className="field-label">
              PRESET NAME
            </label>
            <input
              id="preset-name"
              value={presetName}
              maxLength={40}
              required
              autoFocus
              onChange={(e) => setPresetName(e.target.value)}
            />
            <button
              className="button primary"
              type="submit"
              disabled={!presetName.trim()}
            >
              <Save size={16} />
              Save to collection
            </button>
          </form>
        </div>
      </dialog>
      <dialog
        ref={guideRef}
        className="modal guide-modal"
        aria-labelledby="guide-title"
        onCancel={() => setGuideDialog(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setGuideDialog(false);
        }}
      >
        <div className="modal-content">
          <button
            className="icon-button modal-close"
            aria-label="Close field guide"
            onClick={() => setGuideDialog(false)}
          >
            <X size={20} />
          </button>
          <span className="modal-icon">
            <BookOpen size={24} />
          </span>
          <p className="eyebrow">A FIELD GUIDE TO THE ATELIER</p>
          <h2 id="guide-title">Your legend starts here.</h2>
          <p>A creative character planner inspired by World of Warcraft.</p>
          <ol className="guide-steps">
            <li>
              <span>01</span>
              <div>
                <h3>Find your identity</h3>
                <p>
                  Choose any of six races and classes. This creative sandbox
                  allows every combination.
                </p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <h3>Make your mark</h3>
                <p>
                  Change colors, hair, and magical glow in Appearance. Equip
                  curated fantasy gear to change your preview stats.
                </p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <h3>Keep your favorites</h3>
                <p>
                  Save multiple presets in My collection, or export your
                  character as JSON. Your latest character is restored when you
                  return.
                </p>
              </div>
            </li>
          </ol>
          <div className="info-note">
            <CircleHelp size={18} />
            <p>
              Preview art, equipment, and stats are illustrative. This tool does
              not connect to Blizzard, change your in-game character, or
              simulate live-game combat.
            </p>
          </div>
          <button
            className="button primary"
            onClick={() => setGuideDialog(false)}
          >
            Let’s create
            <Sparkles size={16} />
          </button>
        </div>
      </dialog>
      {toast && (
        <div role="status" className="toast">
          <Check size={17} />
          <span>{toast}</span>
          <button
            className="icon-button"
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

function ColorPicker({
  title,
  colors,
  selected,
  onSelect,
}: {
  title: string;
  colors: { name: string; value: string }[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <fieldset className="color-picker">
      <legend className="field-label">
        {title.toUpperCase()}
        <span>
          {colors.find((c) => c.value === selected)?.name || "Custom"}
        </span>
      </legend>
      <div className="swatches">
        {colors.map((color) => (
          <button
            type="button"
            key={color.value}
            className={`swatch ${color.value === selected ? "selected" : ""}`}
            style={{ "--swatch-color": color.value } as React.CSSProperties}
            aria-label={`${title}: ${color.name}`}
            aria-pressed={color.value === selected}
            onClick={() => onSelect(color.value)}
            title={color.name}
          >
            {color.value === selected && <Check size={17} />}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function RaceSymbol({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path
        d="M20 3 32 10 30 29 20 37 10 29 8 10Z"
        fill="currentColor"
        opacity=".08"
      />
      <path
        d={
          name === "Night Elf" || name === "Blood Elf"
            ? "M10 17 3 12l10 17 7 5 7-5 10-17-7 5M13 14l7-7 7 7-1 14-6 5-6-5Z M14 20l4 2m4 0 4-2M20 7v12"
            : name === "Orc"
              ? "m10 12 5-5h10l5 5-2 17-8 5-8-5ZM12 23l5 4 3-2 3 2 5-4M13 20h4m6 0h4M12 29l-1-8m17 8 1-8"
              : name === "Dwarf"
                ? "M10 13l5-6h10l5 6-2 13-8 9-8-9ZM12 13h16M14 19h3m6 0h3M12 24l8 5 8-5M16 28v-6m8 6v-6M20 29v6"
                : name === "Undead"
                  ? "m12 9 8-3 8 3 3 11-5 6v6H14v-6l-5-6ZM13 18l5 3m4 0 5-3M17 28h6M20 22v3"
                  : "M12 12 20 6l8 6-1 15-7 7-7-7ZM11 13h18M14 19h3m6 0h3M17 27h6M20 8v5"
        }
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function MiniEmblem({ type }: { type: string }) {
  const Icon = icons[type as keyof typeof icons] || Sword;
  return (
    <>
      <span className="emblem-circle" />
      <Icon size={24} strokeWidth={1} />
    </>
  );
}
function ArrowUpRightIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <path d="M3 9 9 3M3 3h6v6" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export default App;
