import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { defaultCharacter, gearItems, starterPresets } from "./data";

const CHARACTER_KEY = "armory-character-v1";
const PRESETS_KEY = "armory-presets-v1";

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
});

beforeEach(() => localStorage.clear());

describe("character studio", () => {
  it("updates identity, portrait, faction, and base stats when choosing a race and class", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(
      screen.getByRole("img", {
        name: "Night Elf Hunter with customised equipment",
      }),
    ).toBeInTheDocument();
    const hunterIntellect = Number(
      screen.getByTestId("stat-intellect").textContent,
    );

    await user.click(screen.getByRole("button", { name: "Orc" }));
    await user.click(screen.getByRole("button", { name: "Mage" }));

    expect(
      screen.getByRole("img", { name: "Orc Mage with customised equipment" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Blood Fury")).toBeInTheDocument();
    expect(
      screen.getByText("Shape arcane power, fire, and frost to your will."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Orc" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Mage" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      Number(screen.getByTestId("stat-intellect").textContent),
    ).toBeGreaterThan(hunterIntellect);
    expect(JSON.parse(localStorage.getItem(CHARACTER_KEY)!).race).toBe("Orc");
  });

  it("applies appearance colors, hair style, and magical glow to the saved character", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("tab", { name: "Appearance" }));
    await user.click(
      screen.getByRole("button", { name: "Armor palette: Crimson" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Hair color: Golden" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Skin tone: Deep bronze" }),
    );
    await user.click(screen.getByRole("button", { name: "Braided" }));
    await user.click(screen.getByRole("switch", { name: "Arcane glow" }));

    expect(
      screen.getByRole("button", { name: "Armor palette: Crimson" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("button", { name: "Armor palette: Moonlit jade" }),
    ).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "Braided" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      screen.getByRole("switch", { name: "Arcane glow" }),
    ).not.toBeChecked();
    expect(JSON.parse(localStorage.getItem(CHARACTER_KEY)!)).toMatchObject({
      armorColor: "#b35660",
      hairColor: "#d6b475",
      skinColor: "#855b49",
      hairStyle: "Braided",
      glow: false,
    });
    const portrait = screen.getByRole("img", {
      name: /with customised equipment/,
    });
    expect(
      portrait.querySelector('stop[stop-color="#b35660"]'),
    ).toBeInTheDocument();
    expect(
      portrait.querySelector('stop[stop-color="#d6b475"]'),
    ).toBeInTheDocument();
  });

  it("removes a weapon, updates item level and stats, and equips only one weapon per slot", async () => {
    const user = userEvent.setup();
    render(<App />);
    const originalAgility = Number(
      screen.getByTestId("stat-agility").textContent,
    );
    const originalLevel = Number(
      screen.getByTestId("item-level").firstChild!.textContent,
    );
    await user.click(screen.getByRole("tab", { name: "Equipment" }));
    await user.click(
      screen.getByRole("button", { name: /Whisper of the Wild/ }),
    );

    expect(
      screen.getByRole("button", { name: /Whisper of the Wild/ }),
    ).toHaveAttribute("aria-pressed", "false");
    expect(Number(screen.getByTestId("stat-agility").textContent)).toBe(
      originalAgility -
        gearItems.find((i) => i.id === "weapon-moonbow")!.stats.agility,
    );
    expect(
      Number(screen.getByTestId("item-level").firstChild!.textContent),
    ).toBeLessThan(originalLevel);
    expect(
      JSON.parse(localStorage.getItem(CHARACTER_KEY)!).equipment,
    ).not.toContain("weapon-moonbow");

    await user.click(screen.getByRole("button", { name: /Dawnbreaker/ }));
    await user.click(screen.getByRole("button", { name: /Starfall Spire/ }));
    const equipment: string[] = JSON.parse(
      localStorage.getItem(CHARACTER_KEY)!,
    ).equipment;
    expect(equipment.filter((id) => id.startsWith("weapon-"))).toEqual([
      "weapon-starfall",
    ]);
    expect(screen.getByRole("button", { name: /Dawnbreaker/ })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(
      screen.getByRole("button", { name: /Starfall Spire/ }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("removes unequipped armor from the illustration and displays the chosen weapon independently of class", async () => {
    const user = userEvent.setup();
    render(<App />);
    const portrait = screen.getByRole("img", { name: /Night Elf Hunter/ });
    expect(
      portrait.querySelector('[data-equipment-slot="head"]'),
    ).toHaveAttribute("data-equipment-id", "head-moonwarden");
    expect(
      portrait.querySelector('[data-equipment-slot="weapon"]'),
    ).toHaveAttribute("data-equipment-id", "weapon-moonbow");

    await user.click(screen.getByRole("tab", { name: "Equipment" }));
    await user.click(
      screen.getByRole("button", { name: /Moonwarden’s Circlet/ }),
    );
    expect(
      portrait.querySelector('[data-equipment-slot="head"]'),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Dawnbreaker/ }));
    expect(
      portrait.querySelector('[data-equipment-slot="weapon"]'),
    ).toHaveAttribute("data-equipment-id", "weapon-sunblade");
    await user.click(screen.getByRole("tab", { name: "Identity" }));
    await user.click(screen.getByRole("button", { name: "Mage" }));
    expect(
      screen
        .getByRole("img", { name: /Night Elf Mage/ })
        .querySelector('[data-equipment-slot="weapon"]'),
    ).toHaveAttribute("data-equipment-id", "weapon-sunblade");
  });

  it("supports arrow-key tab navigation and accessible dialog names", async () => {
    const user = userEvent.setup();
    render(<App />);
    screen.getByRole("tab", { name: "Identity" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Appearance" })).toHaveFocus();
    expect(screen.getByRole("tab", { name: "Appearance" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(
      screen.getByRole("tabpanel", { name: "Appearance" }),
    ).toBeInTheDocument();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Equipment" })).toHaveFocus();
    expect(
      screen.getByRole("tabpanel", { name: "Equipment" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Save preset" }));
    expect(
      screen.getByRole("dialog", { name: "Remember this legend." }),
    ).toBeInTheDocument();
  });

  it("saves a named preset, reloads it from the collection, and deletes it", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.clear(screen.getByLabelText(/CHARACTER NAME/));
    await user.type(screen.getByLabelText(/CHARACTER NAME/), "Mira");
    await user.click(screen.getByRole("button", { name: "Mage" }));
    await user.click(screen.getByRole("button", { name: "Save preset" }));
    const dialog = screen.getByRole("dialog");
    await user.clear(within(dialog).getByLabelText("PRESET NAME"));
    await user.type(within(dialog).getByLabelText("PRESET NAME"), "Moonfire");
    await user.click(
      within(dialog).getByRole("button", { name: "Save to collection" }),
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(PRESETS_KEY)!)).toEqual([
      expect.objectContaining({
        name: "Moonfire",
        character: expect.objectContaining({ name: "Mira", className: "Mage" }),
      }),
    ]);

    await user.click(screen.getByRole("button", { name: "Reset" }));
    await user.click(screen.getByRole("button", { name: /My collection/ }));
    expect(
      screen.getByRole("heading", { name: "Moonfire" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Load character" }));
    expect(screen.getByLabelText(/CHARACTER NAME/)).toHaveValue("Mira");
    expect(
      screen.getByRole("img", {
        name: "Night Elf Mage with customised equipment",
      }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /My collection/ }));
    await user.click(screen.getByRole("button", { name: "Delete Moonfire" }));
    expect(
      screen.getByText("Your next legend belongs here."),
    ).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(PRESETS_KEY)!)).toEqual([]);
  });

  it("loads an inspiration preset with its identity, palette, and gear", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /Dawnbringer/ }));
    expect(screen.getByLabelText(/CHARACTER NAME/)).toHaveValue("Thalion");
    expect(
      screen.getByRole("img", {
        name: "Blood Elf Paladin with customised equipment",
      }),
    ).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(CHARACTER_KEY)!)).toEqual(
      starterPresets[1].character,
    );
  });

  it("restores a valid current character and saved collection after a page reload", async () => {
    const user = userEvent.setup();
    const character = {
      ...defaultCharacter,
      name: "Rill",
      race: "Dwarf",
      className: "Warrior",
    };
    localStorage.setItem(CHARACTER_KEY, JSON.stringify(character));
    localStorage.setItem(
      PRESETS_KEY,
      JSON.stringify([
        {
          id: "saved-one",
          name: "Mountain guard",
          description: "Dwarf · Warrior",
          character,
        },
      ]),
    );
    render(<App />);
    expect(screen.getByLabelText(/CHARACTER NAME/)).toHaveValue("Rill");
    expect(
      screen.getByRole("img", {
        name: "Dwarf Warrior with customised equipment",
      }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /My collection/ }));
    expect(
      screen.getByRole("heading", { name: "Mountain guard" }),
    ).toBeInTheDocument();
  });

  it.each([
    ["malformed JSON", "{broken"],
    [
      "an invalid character",
      JSON.stringify({
        ...defaultCharacter,
        className: "Unknown",
        equipment: ["missing-item"],
      }),
    ],
  ])(
    "recovers from %s in browser storage without breaking the studio",
    (_description, stored) => {
      localStorage.setItem(CHARACTER_KEY, stored);
      localStorage.setItem(PRESETS_KEY, "{bad presets");
      render(<App />);
      expect(screen.getByLabelText(/CHARACTER NAME/)).toHaveValue("Aeloria");
      expect(
        screen.getByRole("img", {
          name: "Night Elf Hunter with customised equipment",
        }),
      ).toBeInTheDocument();
      expect(JSON.parse(localStorage.getItem(CHARACTER_KEY)!)).toEqual(
        defaultCharacter,
      );
    },
  );
});
