export type Stats = {
  strength: number;
  agility: number;
  intellect: number;
  stamina: number;
};

export type Race = {
  id: string;
  name: string;
  faction: "Alliance" | "Horde";
  description: string;
  bonus: string;
  icon: string;
};

export type ClassOption = {
  id: string;
  name: string;
  role: string;
  description: string;
  color: string;
  icon: string;
  baseStats: Stats;
};

export type GearItem = {
  id: string;
  name: string;
  slot: "Head" | "Shoulders" | "Weapon" | "Chest";
  rarity: "Epic" | "Rare" | "Legendary";
  level: number;
  icon: string;
  stats: Stats;
};

export type Character = {
  name: string;
  race: string;
  className: string;
  armorColor: string;
  hairColor: string;
  skinColor: string;
  hairStyle: string;
  glow: boolean;
  equipment: string[];
};

export const races: Race[] = [
  {
    id: "human",
    name: "Human",
    faction: "Alliance",
    description: "Resilient adventurers of the Eastern Kingdoms.",
    bonus: "The Human Spirit",
    icon: "HU",
  },
  {
    id: "night-elf",
    name: "Night Elf",
    faction: "Alliance",
    description: "Ancient guardians beneath the light of Elune.",
    bonus: "Shadowmeld",
    icon: "NE",
  },
  {
    id: "dwarf",
    name: "Dwarf",
    faction: "Alliance",
    description: "Stalwart explorers forged in the heart of the mountains.",
    bonus: "Stoneform",
    icon: "DW",
  },
  {
    id: "orc",
    name: "Orc",
    faction: "Horde",
    description: "Proud warriors bound by honor and ancestral strength.",
    bonus: "Blood Fury",
    icon: "OR",
  },
  {
    id: "blood-elf",
    name: "Blood Elf",
    faction: "Horde",
    description:
      "Graceful wielders of magic from the golden spires of Quel’Thalas.",
    bonus: "Arcane Torrent",
    icon: "BE",
  },
  {
    id: "undead",
    name: "Undead",
    faction: "Horde",
    description: "The Forsaken carve their own destiny beyond the grave.",
    bonus: "Will of the Forsaken",
    icon: "UN",
  },
];

export const classes: ClassOption[] = [
  {
    id: "warrior",
    name: "Warrior",
    role: "Tank / Damage",
    description: "Master of weapons. Forged for the front line.",
    color: "#c69b6d",
    icon: "swords",
    baseStats: { strength: 380, agility: 110, intellect: 65, stamina: 420 },
  },
  {
    id: "mage",
    name: "Mage",
    role: "Ranged Damage",
    description: "Shape arcane power, fire, and frost to your will.",
    color: "#69ccf0",
    icon: "sparkles",
    baseStats: { strength: 60, agility: 95, intellect: 410, stamina: 270 },
  },
  {
    id: "rogue",
    name: "Rogue",
    role: "Melee Damage",
    description: "Strike from the shadows with unrivaled precision.",
    color: "#fff080",
    icon: "dagger",
    baseStats: { strength: 120, agility: 400, intellect: 70, stamina: 310 },
  },
  {
    id: "paladin",
    name: "Paladin",
    role: "Tank / Healer / Damage",
    description: "A champion of the Light, sworn to protect.",
    color: "#f48cba",
    icon: "shield",
    baseStats: { strength: 310, agility: 80, intellect: 230, stamina: 390 },
  },
  {
    id: "hunter",
    name: "Hunter",
    role: "Ranged / Melee Damage",
    description: "A wild heart. An unerring eye. A loyal companion.",
    color: "#aad372",
    icon: "bow",
    baseStats: { strength: 115, agility: 385, intellect: 105, stamina: 335 },
  },
  {
    id: "druid",
    name: "Druid",
    role: "Tank / Healer / Damage",
    description: "Channel the wild and embrace the balance of nature.",
    color: "#ff7c0a",
    icon: "leaf",
    baseStats: { strength: 150, agility: 255, intellect: 310, stamina: 330 },
  },
];

export const gearItems: GearItem[] = [
  {
    id: "head-moonwarden",
    name: "Moonwarden’s Circlet",
    slot: "Head",
    rarity: "Epic",
    level: 639,
    icon: "crown",
    stats: { strength: 0, agility: 85, intellect: 30, stamina: 110 },
  },
  {
    id: "head-ironbark",
    name: "Ironbark Greathelm",
    slot: "Head",
    rarity: "Epic",
    level: 632,
    icon: "helmet",
    stats: { strength: 95, agility: 0, intellect: 0, stamina: 135 },
  },
  {
    id: "head-arcane",
    name: "Crown of Arcane Echoes",
    slot: "Head",
    rarity: "Rare",
    level: 619,
    icon: "crown",
    stats: { strength: 0, agility: 0, intellect: 100, stamina: 90 },
  },
  {
    id: "shoulders-moonwarden",
    name: "Moonwarden’s Mantle",
    slot: "Shoulders",
    rarity: "Epic",
    level: 639,
    icon: "mountain",
    stats: { strength: 0, agility: 70, intellect: 20, stamina: 95 },
  },
  {
    id: "shoulders-dawn",
    name: "Pauldrons of the Dawn",
    slot: "Shoulders",
    rarity: "Epic",
    level: 632,
    icon: "sun",
    stats: { strength: 80, agility: 0, intellect: 25, stamina: 110 },
  },
  {
    id: "shoulders-shadow",
    name: "Shadowstalker’s Shroud",
    slot: "Shoulders",
    rarity: "Rare",
    level: 619,
    icon: "feather",
    stats: { strength: 0, agility: 90, intellect: 0, stamina: 85 },
  },
  {
    id: "weapon-moonbow",
    name: "Whisper of the Wild",
    slot: "Weapon",
    rarity: "Legendary",
    level: 645,
    icon: "bow",
    stats: { strength: 0, agility: 150, intellect: 20, stamina: 100 },
  },
  {
    id: "weapon-sunblade",
    name: "Dawnbreaker",
    slot: "Weapon",
    rarity: "Epic",
    level: 639,
    icon: "sword",
    stats: { strength: 145, agility: 0, intellect: 0, stamina: 125 },
  },
  {
    id: "weapon-starfall",
    name: "Starfall Spire",
    slot: "Weapon",
    rarity: "Epic",
    level: 639,
    icon: "wand",
    stats: { strength: 0, agility: 0, intellect: 160, stamina: 90 },
  },
  {
    id: "chest-moonwarden",
    name: "Moonwarden’s Hauberk",
    slot: "Chest",
    rarity: "Epic",
    level: 639,
    icon: "shirt",
    stats: { strength: 0, agility: 110, intellect: 15, stamina: 145 },
  },
  {
    id: "chest-vanguard",
    name: "Vanguard’s Breastplate",
    slot: "Chest",
    rarity: "Epic",
    level: 632,
    icon: "shield",
    stats: { strength: 120, agility: 0, intellect: 0, stamina: 170 },
  },
  {
    id: "chest-twilight",
    name: "Vestments of Twilight",
    slot: "Chest",
    rarity: "Rare",
    level: 619,
    icon: "shirt",
    stats: { strength: 0, agility: 0, intellect: 120, stamina: 120 },
  },
];

export const armorColors = [
  { name: "Moonlit jade", value: "#4ba69c" },
  { name: "Antique gold", value: "#c4a36a" },
  { name: "Crimson", value: "#b35660" },
  { name: "Arcane violet", value: "#9677b5" },
  { name: "Frost silver", value: "#a6bcc9" },
  { name: "Obsidian", value: "#565967" },
];

export const hairColors = [
  { name: "Moon silver", value: "#d7e3df" },
  { name: "Midnight", value: "#282c3a" },
  { name: "Golden", value: "#d6b475" },
  { name: "Auburn", value: "#a45842" },
  { name: "Amethyst", value: "#9576b1" },
  { name: "Forest", value: "#4a766c" },
];

export const skinColors = [
  { name: "Dusklight", value: "#b0a0c8" },
  { name: "Ivory", value: "#e5c3ad" },
  { name: "Warm sand", value: "#c59673" },
  { name: "Deep bronze", value: "#855b49" },
  { name: "Moss green", value: "#89a376" },
  { name: "Ash", value: "#a1aaa0" },
];

export const hairStyles = ["Long", "Braided", "Short", "Crest"];

export const defaultCharacter: Character = {
  name: "Aeloria",
  race: "Night Elf",
  className: "Hunter",
  armorColor: armorColors[0].value,
  hairColor: hairColors[0].value,
  skinColor: skinColors[0].value,
  hairStyle: "Long",
  glow: true,
  equipment: [
    "head-moonwarden",
    "shoulders-moonwarden",
    "weapon-moonbow",
    "chest-moonwarden",
  ],
};

export const starterPresets: {
  id: string;
  name: string;
  description: string;
  character: Character;
}[] = [
  {
    id: "moonwarden",
    name: "Moonwarden",
    description: "A sentinel beneath the stars",
    character: {
      ...defaultCharacter,
      equipment: [...defaultCharacter.equipment],
    },
  },
  {
    id: "dawnbringer",
    name: "Dawnbringer",
    description: "The first light of a new age",
    character: {
      name: "Thalion",
      race: "Blood Elf",
      className: "Paladin",
      armorColor: armorColors[1].value,
      hairColor: hairColors[2].value,
      skinColor: skinColors[1].value,
      hairStyle: "Braided",
      glow: true,
      equipment: [
        "head-ironbark",
        "shoulders-dawn",
        "weapon-sunblade",
        "chest-vanguard",
      ],
    },
  },
  {
    id: "spellweaver",
    name: "Spellweaver",
    description: "A little arcane, a little mystery",
    character: {
      name: "Lyriel",
      race: "Human",
      className: "Mage",
      armorColor: armorColors[3].value,
      hairColor: hairColors[1].value,
      skinColor: skinColors[2].value,
      hairStyle: "Short",
      glow: true,
      equipment: [
        "head-arcane",
        "shoulders-shadow",
        "weapon-starfall",
        "chest-twilight",
      ],
    },
  },
];
