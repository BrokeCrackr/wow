import { useState } from "react";
import { ImageOff } from "lucide-react";

const portraits: Record<string, string> = {
  "Night Elf": "night-elf",
  Human: "human",
  Dwarf: "dwarf",
  Orc: "orc",
  "Blood Elf": "blood-elf",
  Undead: "undead",
};

type CinematicPortraitProps = {
  race: string;
  onSwitchToLive: () => void;
};

/** Cinematic race artwork; exact equipment and appearance use the live view. */
export default function CinematicPortrait({
  race,
  onSwitchToLive,
}: CinematicPortraitProps) {
  const source = `/portraits/${portraits[race] || "night-elf"}.png`;
  const [failedSource, setFailedSource] = useState<string | null>(null);

  if (failedSource === source) {
    return (
      <div className="cinematic-fallback" role="status">
        <ImageOff size={30} strokeWidth={1.2} aria-hidden="true" />
        <h3>HD portrait unavailable</h3>
        <p>You can keep creating with the live character preview.</p>
        <button className="button subtle" onClick={onSwitchToLive}>
          Use live customisation
        </button>
      </div>
    );
  }

  return (
    <img
      className="cinematic-portrait"
      src={source}
      alt={`${race} cinematic HD character portrait`}
      width={1024}
      height={1536}
      decoding="async"
      fetchPriority="high"
      onError={() => setFailedSource(source)}
    />
  );
}
