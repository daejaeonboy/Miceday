import React, { useEffect, useState } from "react";
import { Container } from "./ui/Container";
import { AllianceMember, getAllianceMembers } from "../src/api/cmsApi";

interface LogoItem {
  id?: string;
  name: string;
  imageSrc?: string;
}

interface MarqueeRowProps {
  logos: LogoItem[];
  direction: "left" | "right";
}

const SECTION_TITLE = "\uD568\uAED8 \uC131\uC7A5\uD558\uB294 \uD30C\uD2B8\uB108";
const logoFrameClass =
  "flex h-16 w-[180px] shrink-0 items-center justify-center rounded-2xl border border-transparent px-4 md:h-20 md:w-[260px]";

const fallbackLogos: LogoItem[] = [
  { name: "KOREA NATIONAL UNIVERSITY" },
  { name: "SK telecom" },
  { name: "SHINSEGAE" },
  { name: "LG\uC0DD\uD65C\uAC74\uAC15" },
  { name: "THE HYUNDAI" },
  { name: "\uB300\uD55C\uBBFC\uAD6D\uBC15\uBB3C\uAD00\uD611\uD68C" },
  { name: "emart" },
  { name: "citi" },
  { name: "Hanwha Hotels & Resorts" },
  { name: "\uC0BC\uC131\uC11C\uC6B8\uBCD1\uC6D0" },
  { name: "BIFAN" },
];

const ensureMinimumRowLength = (items: LogoItem[], minimum: number) => {
  if (items.length === 0) return items;

  const repeated: LogoItem[] = [];
  while (repeated.length < minimum) {
    repeated.push(...items);
  }

  return repeated;
};

const splitLogosIntoRows = (items: LogoItem[]) => {
  if (items.length === 0) {
    return {
      topRow: fallbackLogos.slice(0, 5),
      bottomRow: fallbackLogos.slice(5),
    };
  }

  const topRow = items.filter((_, index) => index % 2 === 0);
  const bottomRow = items.filter((_, index) => index % 2 === 1);

  return {
    topRow: ensureMinimumRowLength(topRow.length > 0 ? topRow : items, 6),
    bottomRow: ensureMinimumRowLength(bottomRow.length > 0 ? bottomRow : items, 6),
  };
};

const MarqueeRow: React.FC<MarqueeRowProps> = ({ logos, direction }) => {
  const repeated = [...logos, ...logos];
  const animationDuration = `${Math.max(24, logos.length * 5)}s`;

  return (
    <div className="w-full overflow-hidden">
      <div
        className={`flex w-max items-center gap-6 py-4 will-change-transform md:gap-10 md:py-5 ${
          direction === "left" ? "animate-marquee-left" : "animate-marquee-right"
        }`}
        style={{ animationDuration }}
      >
        {repeated.map((item, index) => (
          <div key={`${item.id || item.name}-${index}`} className={logoFrameClass}>
            {item.imageSrc ? (
              <img
                src={item.imageSrc}
                alt={item.name}
                className="h-full w-full object-contain"
                loading="lazy"
              />
            ) : (
              <span className="text-center text-[22px] font-black tracking-[-0.02em] text-slate-500/80 md:text-[34px]">
                {item.name}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const ClientLogoMarqueeSection: React.FC = () => {
  const [logos, setLogos] = useState<LogoItem[]>(fallbackLogos);

  useEffect(() => {
    const loadLogos = async () => {
      try {
        const data = await getAllianceMembers();
        const mapped = data
          .filter((item: AllianceMember) => item.is_active && item.logo_url)
          .map((item: AllianceMember) => ({
            id: item.id,
            name: item.name,
            imageSrc: item.logo_url || undefined,
          }));

        if (mapped.length > 0) {
          setLogos(mapped);
        }
      } catch (error) {
        console.error("Failed to load client logos:", error);
      }
    };

    loadLogos();
  }, []);

  const { topRow, bottomRow } = splitLogosIntoRows(logos);

  return (
    <section className="border-y border-slate-200 bg-white py-14 md:py-20">
      <Container>
        <div className="mb-8 md:mb-14">
          <p className="mb-3 text-[11px] font-bold tracking-[0.15em] text-[#001E45]/80">CLIENTS</p>
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-4xl">
            {SECTION_TITLE}
          </h2>
        </div>
      </Container>

      <div className="w-full overflow-x-hidden">
        <div className="space-y-5 md:space-y-7">
          <MarqueeRow logos={topRow} direction="left" />
          <MarqueeRow logos={bottomRow} direction="right" />
        </div>
      </div>
    </section>
  );
};