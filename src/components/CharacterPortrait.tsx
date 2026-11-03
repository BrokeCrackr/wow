import { useId } from "react";

type CharacterPortraitProps = {
  race: string;
  className: string;
  armorColor: string;
  hairColor: string;
  skinColor: string;
  hairStyle: string;
  glow: boolean;
  rotation: number;
  equipment: string[];
};

/** An original, reactive character illustration; no remote assets are needed. */
export default function CharacterPortrait({
  race,
  className,
  armorColor,
  hairColor,
  skinColor,
  hairStyle,
  glow,
  rotation,
  equipment,
}: CharacterPortraitProps) {
  const id = useId().replace(/:/g, "");
  const paint = (name: string) => `url(#${id}-${name})`;
  const isElf = race.includes("Elf");
  const isOrc = race === "Orc";
  const isDwarf = race === "Dwarf";
  const isUndead = race === "Undead";
  const aura =
    className === "Mage"
      ? "#77c3ff"
      : className === "Paladin"
        ? "#ffe6a1"
        : className === "Rogue"
          ? "#bc91f7"
          : className === "Druid" || className === "Hunter"
            ? "#a8dc93"
            : "#f5c980";
  const head = equipment.find((item) => item.startsWith("head-"));
  const shoulders = equipment.find((item) => item.startsWith("shoulders-"));
  const chest = equipment.find((item) => item.startsWith("chest-"));
  const weapon = equipment.find((item) => item.startsWith("weapon-"));
  const longHair = hairStyle === "Long" || hairStyle === "Braided";
  const bodyWidth = isOrc ? 1.13 : isDwarf ? 1.1 : 1;
  const turn = Math.max(0.72, Math.abs(Math.cos((rotation * Math.PI) / 180)));

  return (
    <svg
      className="character-portrait"
      viewBox="0 0 420 520"
      fill="none"
      role="img"
      aria-label={`${race} ${className} with ${equipment.length ? "customised equipment" : "a simple adventurer outfit"}`}
      style={{ width: "100%", height: "100%", overflow: "visible" }}
    >
      <defs>
        <radialGradient id={`${id}-halo`}>
          <stop stopColor={aura} stopOpacity=".19" />
          <stop offset=".56" stopColor={aura} stopOpacity=".055" />
          <stop offset="1" stopColor={aura} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-ground`}>
          <stop stopColor="#000" stopOpacity=".8" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <linearGradient
          id={`${id}-armor`}
          x1="150"
          y1="180"
          x2="275"
          y2="405"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={armorColor} />
          <stop offset=".32" stopColor={armorColor} />
          <stop offset="1" stopColor="#131f28" />
        </linearGradient>
        <linearGradient
          id={`${id}-metal`}
          x1="132"
          y1="175"
          x2="280"
          y2="420"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#e7cf8c" />
          <stop offset=".27" stopColor="#a58a54" />
          <stop offset=".55" stopColor="#f3dfa5" />
          <stop offset="1" stopColor="#655131" />
        </linearGradient>
        <linearGradient
          id={`${id}-skin`}
          x1="187"
          y1="117"
          x2="230"
          y2="186"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={skinColor} />
          <stop offset=".6" stopColor={skinColor} />
          <stop offset="1" stopColor="#5b4652" />
        </linearGradient>
        <linearGradient
          id={`${id}-hair`}
          x1="165"
          y1="100"
          x2="253"
          y2="264"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={hairColor} />
          <stop offset=".35" stopColor={hairColor} />
          <stop offset="1" stopColor="#18232b" />
        </linearGradient>
        <linearGradient
          id={`${id}-cape`}
          x1="147"
          y1="208"
          x2="266"
          y2="453"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={armorColor} stopOpacity=".9" />
          <stop offset="1" stopColor="#0d151e" />
        </linearGradient>
        <linearGradient
          id={`${id}-blade`}
          x1="303"
          y1="110"
          x2="326"
          y2="322"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#e7e6d0" />
          <stop offset=".5" stopColor="#859e9e" />
          <stop offset="1" stopColor="#364f5d" />
        </linearGradient>
        <filter
          id={`${id}-light`}
          x="-100%"
          y="-100%"
          width="300%"
          height="300%"
        >
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>

      <ellipse cx="210" cy="261" rx="210" ry="224" fill={paint("halo")} />
      <g stroke={aura} opacity=".14">
        <circle cx="210" cy="234" r="157" strokeWidth=".7" />
        <circle
          cx="210"
          cy="234"
          r="150"
          strokeDasharray="1 16"
          strokeWidth="3"
        />
        <path d="M210 65v14m0 310v14M41 234h14m310 0h14M90 114l10 10m220 220 10 10M90 354l10-10m220-220 10-10" />
        <path
          d="m210 55 5 9-5 9-5-9 5-9ZM210 396l5 9-5 9-5-9 5-9Z"
          fill={aura}
        />
      </g>
      <ellipse cx="211" cy="483" rx="127" ry="23" fill={paint("ground")} />
      <ellipse
        cx="211"
        cy="484"
        rx="93"
        ry="13"
        stroke={aura}
        strokeOpacity=".2"
      />
      <ellipse
        cx="211"
        cy="484"
        rx="104"
        ry="17"
        stroke={aura}
        strokeOpacity=".08"
        strokeDasharray="22 8"
      />

      <g
        transform={`translate(210 ${isDwarf ? 63 : 0}) scale(${turn * bodyWidth} ${isDwarf ? 0.87 : 1}) translate(-210 0) translate(0 280) skewX(${rotation / 8}) translate(0 -280)`}
      >
        {/* Layered cloak and hair frame the silhouette. */}
        <path
          d="m163 191-30 69-14 162 31 28 30-20 31 21 36-22 28 14 22-21-29-193-18-37Z"
          fill={paint("cape")}
          stroke="#35413d"
          strokeWidth="1.5"
        />
        <path
          d="m161 224-20 189 17 19 22-171m70-35 25 199-24-11-19-159"
          stroke="#b9ad78"
          strokeOpacity=".2"
          strokeWidth="1.5"
        />
        {longHair ? (
          <g data-hair-length="long">
            <path
              d="M171 116c-10 25-12 70-20 114l34 29 31-38 31 28 23-25c-12-42-11-84-24-111-14-28-60-26-75 3Z"
              fill={paint("hair")}
              stroke="#0d171f"
              strokeWidth="2"
            />
            <path
              d="M171 129c-5 34-3 72-14 97m91-104c8 40 5 76 15 101"
              stroke={hairColor}
              strokeOpacity=".55"
              strokeWidth="2"
            />
          </g>
        ) : (
          <path
            data-hair-length="short"
            d="M179 128c-6-23 8-35 31-35s38 15 30 38l-6 22-8-26-29-9-12 35Z"
            fill={paint("hair")}
            stroke="#0d171f"
            strokeWidth="2"
          />
        )}

        {/* Boots, cloth and articulated leg plates. */}
        <path
          d="m177 342 29 3-3 72-13 49-24 3 3-55Zm36 2 30-1 11 72-2 52-24 1-12-53Z"
          fill="#18222a"
          stroke="#070e14"
          strokeWidth="3"
        />
        <path
          d="m172 383 31-3-6 45-18 9-12-18Zm45-3 29 3 10 34-12 16-23-9Z"
          fill={paint("armor")}
          stroke={paint("metal")}
          strokeWidth="1.6"
        />
        <path
          d="m181 390 13-3-5 32-11 6-5-12Zm43-3 15 4 8 24-8 9-10-5Z"
          fill="#d6d4b5"
          fillOpacity=".07"
        />
        <path
          d="m169 432 27-5-4 31 4 16c-5 7-35 11-44 3l9-15Zm55-5 27 6 4 29 14 12c-1 10-33 8-42 2l-3-18Z"
          fill={paint("armor")}
          stroke={paint("metal")}
          strokeWidth="1.5"
        />
        <path
          d="m163 465 27-6m39 0 26 6M158 475l33-5m39 0 31 5"
          stroke="#baa574"
          strokeWidth="2"
        />

        {/* Arm silhouette and gauntlets. */}
        <path
          d="m153 205-20 42-4 55 10 25 19-6 8-74Zm114 0 22 42 3 54-8 25-22-4-7-76Z"
          fill="#26343a"
          stroke="#0c141b"
          strokeWidth="3"
        />
        <path
          d="m135 253 23 5-8 33-20-4Zm128 4 22-5 7 35-20 6Z"
          fill={paint("armor")}
          stroke={paint("metal")}
          strokeWidth="1.5"
        />
        <path
          d="m130 283 25 6-2 33-15 12-15-14Zm138 6 23-6 7 35-16 15-14-12Z"
          fill={paint("armor")}
          stroke={paint("metal")}
          strokeWidth="1.8"
        />
        <path
          d="m128 298 20 4m-21 5 20 4m126-9 19-4m-18 13 19-4"
          stroke="#b7a16b"
          strokeOpacity=".65"
        />
        <path
          d="m133 328 6 13 11-3 2-15m124 1 1 14 11 3 5-14"
          fill={paint("skin")}
          stroke="#554a47"
        />

        {/* Fitted breastplate, sculpted shoulders and overlapping tassets. */}
        <path
          d="m176 189-19 27 15 66-3 31 37 12 44-12-3-31 15-66-20-27Z"
          fill="#29383a"
          stroke="#55625b"
          strokeWidth="1.3"
        />
        <path
          d="m190 194 19 18 21-18m-21 18v72m-28-42 7 27m52-27-7 27"
          stroke="#718077"
          strokeWidth="1.3"
          opacity=".5"
        />
        {chest && (
          <g data-equipment-slot="chest" data-equipment-id={chest}>
            <path
              d="m176 189-19 27 15 66-3 31 37 12 44-12-3-31 15-66-20-27Z"
              fill={paint("armor")}
              stroke={paint("metal")}
              strokeWidth="2"
            />
            <path
              d="m171 209 18-11 21 17 22-17 17 11-8 39-31 13-30-13Z"
              fill="#dce4ca"
              fillOpacity=".07"
            />
            <path
              d="m177 215 32 21 34-21m-69 29 35 20 36-20m-69 17 33 20 34-20"
              stroke={paint("metal")}
              strokeWidth="1.8"
            />
            <path d="m209 204-11 33 11 26 13-26Z" fill={paint("metal")} />
            <path d="m209 217-5 19 5 12 6-12Z" fill={aura} opacity=".85" />
            {chest === "chest-vanguard" && (
              <g>
                <path
                  d="m174 221 15-14 20 20 22-20 15 14-9 40-28 20-27-20Z"
                  fill="#9da891"
                  fillOpacity=".19"
                  stroke={paint("metal")}
                  strokeWidth="2"
                />
                <path d="m209 228-12 18 12 22 13-22Z" fill={paint("metal")} />
                <path d="m209 236-6 10 6 11 7-11Z" fill={armorColor} />
                <path
                  d="m181 234 12 9-7 9m51-18-12 9 7 9"
                  stroke="#e2d29a"
                  strokeWidth="2"
                />
              </g>
            )}
            {chest === "chest-twilight" && (
              <g>
                <path
                  d="m187 195 22 25 23-25-3 41-20 27-20-27Z"
                  fill="#343149"
                  stroke="#ad9ab9"
                  strokeWidth="1.2"
                />
                <path d="m209 221-7 14 7 14 8-14Z" fill={aura} opacity=".8" />
              </g>
            )}
          </g>
        )}
        <path
          d="m171 283 38 10 38-10-2 27-36 12-37-12Z"
          fill="#1c292b"
          stroke={paint("metal")}
          strokeWidth="2"
        />
        <path d="m209 289 14 13-14 15-14-15Z" fill={paint("metal")} />
        <path d="m209 295 7 7-7 8-7-8Z" fill={armorColor} />
        {chest === "chest-twilight" ? (
          <g>
            <path
              d="m173 310-14 133 29 14 22-24 22 24 31-14-17-133-37 15Z"
              fill={paint("armor")}
              stroke={paint("metal")}
              strokeWidth="1.8"
            />
            <path
              d="m185 328-7 102 17-16 15-69 14 69 17 16-9-102M210 348v68"
              stroke="#b2a2c5"
              strokeWidth="1.5"
              opacity=".7"
            />
            <path
              d="m163 435 23 13 24-26 24 26 25-13"
              stroke={paint("metal")}
              strokeWidth="3"
            />
          </g>
        ) : (
          <g>
            <path
              d="m172 312-14 59 31 18 21-57 23 57 31-18-18-59-37 13Z"
              fill={chest ? paint("armor") : "#253437"}
              stroke={chest ? paint("metal") : "#53615b"}
              strokeWidth={chest ? "2" : "1.2"}
            />
            {chest && (
              <>
                <path
                  d="m170 330 23 12m-28 3 23 13m-27 2 22 13m46-31 25-12m-19 28 23-13m-17 28 23-13"
                  stroke="#c6b17c"
                  strokeOpacity=".55"
                  strokeWidth="1.5"
                />
                <path
                  d="m199 322-8 49 19 27 18-27-9-49Z"
                  fill="#263736"
                  stroke={paint("metal")}
                  strokeWidth="1.5"
                />
                <path d="m210 335-5 32 5 12 5-12Z" fill={paint("metal")} />
              </>
            )}
          </g>
        )}
        {shoulders && (
          <g data-equipment-slot="shoulders" data-equipment-id={shoulders}>
            {shoulders === "shoulders-shadow" ? (
              <g>
                <path
                  d="m175 193-29 3-24 23 17 20 31-21 10-14m65-11 29 3 24 23-17 20-31-21-10-14"
                  fill="#343142"
                  stroke="#9b91ab"
                  strokeWidth="1.5"
                />
                <path
                  d="m132 218 25-18-5 18 16-11-6 16-21 15m146-20-25-18 5 18-16-11 6 16 21 15"
                  stroke="#8f839d"
                  strokeWidth="1.3"
                />
              </g>
            ) : (
              <>
                <path
                  d="m157 189-30 7-14 30 29 16 32-18 7-22Z"
                  fill={paint("armor")}
                  stroke={paint("metal")}
                  strokeWidth="2"
                />
                <path
                  d="m263 189 29 7 15 30-29 16-32-18-7-22Z"
                  fill={paint("armor")}
                  stroke={paint("metal")}
                  strokeWidth="2"
                />
                <path
                  d="m122 218 14-27 6 22 17-26 2 32-19 13Zm176 0-14-27-6 22-17-26-2 32 19 13Z"
                  fill="#c6b279"
                  fillOpacity=".3"
                  stroke={paint("metal")}
                  strokeWidth="1.3"
                />
                <path
                  d="m127 201-9-15 17 7m12-1 8-18 5 16m132 11 11-15-18 7m-12-1-8-18-5 16"
                  fill={paint("metal")}
                />
                <path
                  d="m145 209-8 9 8 9 8-9Zm130 0-8 9 8 9 8-9Z"
                  fill={aura}
                  opacity=".85"
                />
                {shoulders === "shoulders-dawn" && (
                  <g>
                    <path
                      d="m124 201 14-13 20 6 11 18-27 14Zm171 0-14-13-20 6-11 18 27 14Z"
                      fill={paint("metal")}
                      stroke="#e3cf96"
                      strokeWidth="1.5"
                    />
                    <circle cx="145" cy="208" r="7" fill={armorColor} />
                    <circle cx="274" cy="208" r="7" fill={armorColor} />
                    <path
                      d="m145 198v20m-10-10h20m119-10v20m-10-10h20"
                      stroke="#e8d9a7"
                      strokeWidth="1.2"
                    />
                  </g>
                )}
              </>
            )}
          </g>
        )}

        {/* Neck, ears and face. */}
        <path
          d="m197 166-3 24 15 13 17-13-5-25Z"
          fill={paint("skin")}
          stroke="#493e47"
        />
        <path
          d={
            isElf
              ? "m184 137-38-12 26 32 15 1m47-21 39-12-27 32-15 1"
              : "m185 137-10-6-2 19 13 6m49-19 11-6 2 19-12 6"
          }
          fill={paint("skin")}
          stroke="#6c5c68"
          strokeWidth="1.4"
        />
        {isElf && (
          <path
            d="m178 143-22-12 19 21m67-9 22-12-19 21"
            stroke="#372e46"
            strokeOpacity=".55"
            strokeWidth="2"
          />
        )}
        <path
          d={
            isOrc
              ? "M184 117q26-18 52 0l3 38-7 23-23 11-24-12-7-21Z"
              : "M186 117q24-18 47 0l-1 39-9 21-14 8-15-9-10-22Z"
          }
          fill={paint("skin")}
          stroke="#715c68"
          strokeWidth="1.2"
        />
        <path d="m188 138 15 1-5 7-10-3m42-5-15 1 5 7 10-3" fill="#27313c" />
        <path
          d="m190 141 10 1m18 0 10-1"
          stroke={aura}
          strokeWidth={isElf || isUndead ? "2.6" : "1.8"}
          strokeLinecap="round"
        />
        <path
          d="m207 142-4 15 8 2m-10 10q8 4 16-1"
          stroke="#70505d"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <path
          d="m188 150 9 7m32-7-9 7"
          stroke={isElf ? "#65497f" : "#ad7b6e"}
          strokeWidth="2"
          opacity=".7"
        />
        {isOrc && (
          <path
            d="m191 170 2-12 7 15m18 0 7-15 2 12"
            fill="#e9dcb4"
            stroke="#9a8b6b"
          />
        )}
        {isUndead && (
          <g stroke="#3c4340" strokeWidth="1.3">
            <path d="m190 151 6 9-5 3m34-12-6 9 6 3m-22 10 1-6m5 8 1-7m5 6 1-6" />
            <path d="m184 130 11-4m27 0 10 4" />
          </g>
        )}
        {isDwarf && (
          <path
            d="m184 154 8 12 15-3 15 3 12-12-1 27-12 30-12 9-15-12-11-30Z"
            fill={paint("hair")}
            stroke="#4c4a42"
          />
        )}

        {/* Hair styles are individually drawn rather than merely relabelled. */}
        {hairStyle === "Short" ? (
          <path
            d="M179 137c-5-26 8-41 31-41 28 0 37 17 29 43l-11-23-17 8-9-8-16 16-3 15Z"
            fill={paint("hair")}
            stroke="#17252c"
          />
        ) : hairStyle === "Crest" ? (
          <g fill={paint("hair")} stroke="#27313a">
            <path d="m187 128 7-22 6-26 9 10 9-17 5 26 13 26-14-8-13 8-10-6Z" />
            <path d="m181 122 4 38 7-40m45 2-3 38-7-40" />
          </g>
        ) : (
          <g>
            <path
              d="M181 148c-8-16-7-38 8-48 14-10 37-9 48 4 11 12 10 31 1 46l-7-29-22-11-19 17-5 35Z"
              fill={paint("hair")}
              stroke="#18242e"
              strokeWidth="1.2"
            />
            <path
              d="M207 105c-13 8-17 24-20 44l-8 39-12 51 18-9 8-42 4-36m21-45c15 14 14 35 18 55l6 37 11 39-16-9-11-38-5-29"
              fill={paint("hair")}
              stroke="#4c5e61"
              strokeOpacity=".3"
            />
            <path
              d="M202 109c-13 20-14 45-17 72m36-70c11 24 7 46 14 71"
              stroke={hairColor}
              strokeOpacity=".5"
              strokeWidth="1.5"
            />
          </g>
        )}
        {hairStyle === "Braided" && (
          <g fill={paint("hair")} stroke="#7d8a7e" strokeWidth=".6">
            {Array.from({ length: 9 }, (_, index) => (
              <path
                key={index}
                d={`m${178 - index * 0.65} ${165 + index * 8}q-8 4 0 10 8-5 0-10Z`}
              />
            ))}
            <path d="m169 238-4 14 10-2-1-12Z" fill={paint("metal")} />
          </g>
        )}
        {head && (
          <g data-equipment-slot="head" data-equipment-id={head}>
            {head === "head-ironbark" ? (
              <g>
                <path
                  d="M181 135v-22l12-17 16-5 17 5 13 17v22l-10-10-20-10-18 10Z"
                  fill={paint("armor")}
                  stroke={paint("metal")}
                  strokeWidth="1.8"
                />
                <path d="m209 94-7 15 7 18 8-18Z" fill={paint("metal")} />
                <path
                  d="m181 126 9 4-2 26-9-11Zm58 0-10 4 3 26 10-11Z"
                  fill={paint("armor")}
                  stroke={paint("metal")}
                  strokeWidth="1.3"
                />
                <path
                  d="m188 110 7-8m29 0 7 8"
                  stroke="#cdbb81"
                  strokeWidth="2"
                />
              </g>
            ) : head === "head-arcane" ? (
              <g>
                <path
                  d="m181 123-3-21 15 10 3-24 13 20 13-20 4 24 15-10-3 21-29 10Z"
                  fill={paint("metal")}
                  stroke="#e3cfac"
                  strokeWidth="1"
                />
                <path d="m184 118 25 8 26-8" stroke="#74728d" strokeWidth="3" />
                <path d="m209 109-6 9 6 11 7-11Z" fill={aura} />
                <circle cx="191" cy="118" r="2" fill={aura} />
                <circle cx="228" cy="118" r="2" fill={aura} />
              </g>
            ) : (
              <>
                <path
                  d="m184 120 11-11 14 8 14-8 13 11-11-5-16 12-15-12Z"
                  fill={paint("metal")}
                />
                <path d="m209 116-4 6 4 7 4-7Z" fill={aura} />
              </>
            )}
          </g>
        )}

        {/* Selected equipment, independent of class in this creative sandbox. */}
        {weapon && (
          <g
            data-equipment-slot="weapon"
            data-equipment-id={weapon}
            transform="rotate(7 286 324)"
          >
            {weapon === "weapon-starfall" ? (
              <g>
                <path
                  d="M288 345V139"
                  stroke={paint("metal")}
                  strokeWidth="7"
                />
                <path
                  d="m287 172-18-26 6-23 12 16 13-16 8 23-20 26Z"
                  fill={paint("armor")}
                  stroke={paint("metal")}
                  strokeWidth="2"
                />
                <path d="m288 118-7 19 7 16 8-16Z" fill={aura} />
                <circle
                  cx="288"
                  cy="136"
                  r="22"
                  fill={aura}
                  opacity=".14"
                  filter={paint("light")}
                />
                <path
                  d="m282 194 12 7m-12 8 12 7m-12 8 12 7m-12 8 12 7"
                  stroke="#c1ab77"
                  strokeWidth="2"
                />
              </g>
            ) : weapon === "weapon-moonbow" ? (
              <g>
                <path
                  d="M288 323q47-80 7-170l-12-12 4 29q25 61 3 127Z"
                  fill={paint("armor")}
                  stroke={paint("metal")}
                  strokeWidth="2"
                />
                <path d="m283 141 5 182" stroke="#d5d5bc" strokeWidth="1" />
                <path
                  d="m272 255 51-35m-5 9 5-9-10 1"
                  stroke="#c0af82"
                  strokeWidth="2"
                />
              </g>
            ) : (
              <g>
                <path
                  d="m279 286 1-141 9-34 11 34-1 141-10 14Z"
                  fill={paint("blade")}
                  stroke="#b3beb2"
                  strokeWidth="1.4"
                />
                <path
                  d="m289 120 1 173m0-130 7-9m-7 37 7-9m-7 37 7-9m-7 38 7-9"
                  stroke="#d3ded1"
                  strokeOpacity=".5"
                />
                <path
                  d="m271 287-10-9 4 16 23 10 24-10 4-16-12 9Z"
                  fill={paint("metal")}
                  stroke="#4e503d"
                />
                <path d="m288 302 1 39" stroke="#384d48" strokeWidth="8" />
                <path
                  d="m285 308 8 4m-8 5 8 4m-8 5 8 4"
                  stroke="#b9a174"
                  strokeWidth="2"
                />
                <path d="m289 338-7 7 7 9 8-9Z" fill={paint("metal")} />
              </g>
            )}
            <path
              d="m278 318 12-3 7 9-5 10-12-1Z"
              fill={paint("skin")}
              stroke="#544f48"
            />
          </g>
        )}

        {glow && (
          <g>
            <g opacity=".65" filter={paint("light")} fill={aura}>
              {shoulders && (
                <>
                  <circle cx="145" cy="218" r="8" />
                  <circle cx="275" cy="218" r="8" />
                </>
              )}
              {chest && <circle cx="209" cy="236" r="7" />}
              {chest && <path d="m171 283 38 10 38-10-2 4-36 10-37-10Z" />}
            </g>
            {shoulders && (
              <path d="m141 218 4-4 4 4-4 5Zm130 0 4-4 4 4-4 5Z" fill={aura} />
            )}
            {chest && <path d="m205 234 4-9 4 9-4 10Z" fill={aura} />}
            {[
              { x: 117, y: 170 },
              { x: 299, y: 209 },
              { x: 151, y: 369 },
              { x: 267, y: 413 },
              { x: 305, y: 151 },
              { x: 118, y: 301 },
            ].map(({ x, y }, index) => (
              <g key={index} opacity={0.3 + (index % 3) * 0.16}>
                <circle cx={x} cy={y} r={index % 2 ? 1.4 : 2} fill={aura} />
                <path
                  d={`M${x - 4} ${y}h8m-4-4v8`}
                  stroke={aura}
                  strokeWidth=".5"
                />
              </g>
            ))}
          </g>
        )}
      </g>
    </svg>
  );
}
