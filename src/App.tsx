import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode, RefObject } from "react";
import { AnimatedRays } from "@/components/ui/animated-rays";
import { LiquidMetal } from "@/components/ui/liquid-metal";
import { MorphText } from "@/components/ui/morph-text";
import { StackedLogos } from "@/components/ui/stacked-logos";
import madrid from "@/assets/cities/madrid.svg";
import toulouse from "@/assets/cities/toulouse.svg";
import paris from "@/assets/cities/paris.svg";
import tas from "@/assets/companies/tas.svg";
import orange from "@/assets/companies/orange.svg";
import airbus from "@/assets/companies/airbus.svg";
import familyandco from "@/assets/companies/familyandco.svg";
import { STACK, logoUrl } from "@/logos";
import SocialFlipButton from "@/components/ui/social-flip-button";

// Recipient of the mailto: links of the social buttons - replace with the real address
const CONTACT_EMAIL = "habib.hammarlebiod@tutanota.com";
import { experienceDetails, projectDetails } from "@/details";
import type { Block, Bullet, CodeTab, Detail } from "@/details";
import type { StackTool } from "@/logos";

const vars = (v: Record<string, string>) => v as CSSProperties;

/**
 * Keeps every [data-fit] title inside `ref` on ONE line, all at the same size:
 * the largest size at which the longest title still fits the container width,
 * capped at maxVh of the window height. Re-runs on resize and when fonts load
 * (so dropping the real Taller file in /public/fonts just works).
 */
function useFit(ref: RefObject<HTMLElement | null>, maxVh: number) {
  useLayoutEffect(() => {
    const root = ref.current!;
    const fit = () => {
      const els = [...root.querySelectorAll<HTMLElement>("[data-fit]")];
      els.forEach((e) => (e.style.fontSize = "100px"));
      const avail = root.clientWidth * 0.96; // small safety margin for kerning/hinting
      const size = Math.min(
        window.innerHeight * maxVh,
        ...els.map((e) => (avail / e.offsetWidth) * 100),
      );
      els.forEach((e) => (e.style.fontSize = `${size}px`));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(root);
    window.addEventListener("resize", fit);
    document.fonts?.ready.then(fit);
    document.fonts?.addEventListener("loadingdone", fit);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", fit);
      document.fonts?.removeEventListener("loadingdone", fit);
    };
  }, [ref, maxVh]);
}

/**
 * Size and position of the big titles (column 1 titles + "Projects").
 * The first title ("5+ years of international experience...") is made as big as possible while its ink
 * (top of the tallest letter to bottom of the deepest descender) is exactly as tall as the first small
 * rectangle of column 2 (the one with the year), and is shifted so that ink top / bottom coincide with that
 * rectangle's top / bottom. All the other big titles use the same size and shift (--title, --title-shift).
 * It never grows wider than the column. Re-runs on resize and when fonts load.
 */
function useTitleLayout(ref: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const grid = ref.current!;
    const ctx = document.createElement("canvas").getContext("2d")!;
    const layout = () => {
      const col1 = grid.children[0] as HTMLElement;
      const titles = [...grid.querySelectorAll<HTMLElement>("[data-title-col1]")];
      titles.forEach((t) => (t.style.fontSize = "100px"));
      const widthsAt100 = titles.map((t) => t.offsetWidth);
      titles.forEach((t) => (t.style.fontSize = ""));

      // ink extents of the first title (em) and where its baseline sits in a line-height:1 box
      ctx.font = `100px ${getComputedStyle(titles[0]).fontFamily}`;
      const m = ctx.measureText(titles[0].textContent ?? "");
      const inkAsc = m.actualBoundingBoxAscent / 100;
      const baseline = (1 + m.fontBoundingBoxAscent / 100 - m.fontBoundingBoxDescent / 100) / 2; // em below the line top
      const inkTopOffset = baseline - inkAsc; // em between the line top and the top of the tallest letter

      const colW = col1.clientWidth;

      // bullets: as big as the column allows (the widest bullet + its 1.5em indent exactly fill the column),
      // but never bigger than half the title size
      const ul = grid.querySelector<HTMLElement>("[data-bullets]");
      let bulletFit = Infinity;
      if (ul) {
        ctx.font = `100px ${getComputedStyle(ul).fontFamily}`;
        const widest = Math.max(...[...grid.querySelectorAll("[data-bullets] li")].map((li) => ctx.measureText(li.textContent ?? "").width));
        bulletFit = (0.965 * colW) / (widest / 100 + 1.5); // 3.5% safety: canvas and DOM text widths differ slightly
      }
      // The first headline should occupy about 70% of column 1's width. Reuse this size
      // for every other editorial headline; DATA ANALYST is fit independently.
      let T = Math.min((colW * 0.70 / widthsAt100[0]) * 100, ...widthsAt100.map((w) => (colW / w) * 100));

      const apply = () => {
        grid.style.setProperty("--title", `${T}px`);
        grid.style.setProperty("--title-shift", `${-inkTopOffset * T}px`);
        grid.style.setProperty("--bullet", `${Math.min(0.5 * T, bulletFit)}px`);
      };
      apply();
      // safety nets: never wider than the column; in very short windows shrink until column 1 fits
      const widest = () => Math.max(...titles.map((t) => t.offsetWidth));
      for (let i = 0; i < 20 && widest() > colW; i++) {
        T *= 0.99;
        apply();
      }
      for (let i = 0; i < 30 && col1.scrollHeight > col1.clientHeight + 1 && T > 18; i++) {
        T *= 0.95;
        apply();
      }
    };
    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(grid);
    window.addEventListener("resize", layout);
    window.addEventListener("load", layout);
    document.fonts?.ready.then(layout);
    document.fonts?.addEventListener("loadingdone", layout);
    // extra passes once webfonts have had time to arrive
    const timers = [300, 1000, 2500].map((ms) => window.setTimeout(layout, ms));
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", layout);
      window.removeEventListener("load", layout);
      document.fonts?.removeEventListener("loadingdone", layout);
      timers.forEach(clearTimeout);
    };
  }, [ref]);
}

/**
 * With a panel open the composition needs TOTALK card heights of width, but closed it only needs CLOSEDK. On a
 * medium-width window that would leave wide empty margins around the closed page, so the closed composition is
 * zoomed in (--k >= 1) until it fills the width as well, and goes back to normal size when a panel opens.
 * `probe` is an invisible element as wide as the card height the closed composition would have (--hc).
 */
function useClosedZoom(grid: RefObject<HTMLElement | null>, probe: RefObject<HTMLElement | null>, enabled: boolean) {
  useLayoutEffect(() => {
    const g = grid.current!;
    if (!enabled) {
      g.style.setProperty("--k", "1");
      return;
    }
    const update = () => {
      const h = g.offsetWidth / TOTALK;
      const hc = probe.current!.offsetWidth;
      // full effect up to 1024px wide, fading out to nothing at 1280px so the desktop layout stays as it was
      const t = Math.min(1, Math.max(0, (1280 - window.innerWidth) / 256));
      g.style.setProperty("--k", String(1 + t * Math.max(0, hc / h - 1)));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(g);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [grid, probe, enabled]);
}

function FitTitle({ children }: { children: ReactNode }) {
  return (
    <h2 data-fit className="w-max whitespace-nowrap font-display leading-none">
      {children}
    </h2>
  );
}

/**
 * Round "+" button with a liquid-metal border (Vengeance UI LiquidMetal shader).
 * Its diameter comes from the --btn CSS variable of the card it sits in.
 * Open state: the "+" turns into a "-" and the black core into a glossy red (CSS in index.css, .plus-*).
 */
function PlusButton({ style, open, onClick, label }: { style: CSSProperties; open: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      aria-label={`${open ? "Close" : "Open"} details: ${label}`}
      aria-expanded={open}
      data-open={open}
      onClick={onClick}
      style={{ ...style, width: "var(--btn)", height: "var(--btn)" }}
      className="plus-btn absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer overflow-hidden rounded-full p-[calc(var(--btn)*0.0625)] transition-transform hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
    >
      <LiquidMetal colorBack="#7d828e" colorTint="#ffffff" speed={0.4} repetition={4} distortion={0.15} className="rounded-full" />
      <span className="plus-core relative z-10 block size-full rounded-full">
        <span className="plus-glyph">
          <span className="plus-bar plus-bar-h" />
          <span className="plus-bar plus-bar-v" />
        </span>
      </span>
    </button>
  );
}

/*
 * LAYOUT MODEL - everything is a multiple of h, the height of one card:
 *   column 1 = W1K x h, column 2 = column 3 = 3 x h (the 3:1 cards), the two gaps between columns = GAPK x h.
 * h is the largest value for which the composition fits the window (see --h below), so the whole page scales
 * uniformly with the screen; on a window wider than that the extra width is simply left empty on both sides.
 */
const W1K = 3.3;
const GAPK = 0.65;
/** Tablet widths (desktop layout, narrow window): a description opens next to its own column only, never three columns at once */
const TABLET_QUERY = "(max-width: 1100px)";
const CLOSEDK = W1K + 6 + 2 * GAPK; // width of the closed composition (column 1 + columns 2 and 3 + 2 gaps), in card heights
const PANELK = 6 + GAPK; // detail panel = the width of two 3h columns plus the gap between them
const TOTALK = 3 + PANELK + 3 + 2 * GAPK; // widest composition: [col 2][panel][col 3] or [col 2][col 3][panel]
const BTN = "calc(var(--h) * 0.39)"; // "+" button diameter (about 48px at a 123px card height)
const STAT_CORNER_GAP = "calc(var(--h) * 0.049)";
const CLUSTER_GAP = "0px";
const CORNER_GAP = "calc(var(--h) * 0.049)";

type Logo = {
  src: string;
  alt: string;
};

/**
 * Logo centred in its rectangle, in a box that is LOGO_BOX_W x LOGO_BOX_H of the rectangle (the same
 * breathing room as the stack logos). The logo keeps its proportions inside that box. Absolutely
 * positioned so that the image's own size never changes the height of the card.
 */
const LOGO_BOX_W = "66%";
const LOGO_BOX_H = "50%";
function LogoCentered({ logo, w = LOGO_BOX_W, h = LOGO_BOX_H }: { logo: Logo; w?: string; h?: string }) {
  return (
    <span className="absolute inset-0">
      <img
        src={logo.src}
        alt={logo.alt}
        draggable={false}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 object-contain"
        style={{ width: w, height: h }}
      />
    </span>
  );
}

/**
 * Column 2 card: a square made from the stacked year/city cells, plus a company rectangle
 * twice as wide. The overall card keeps a strict 3:1 width-to-height ratio at every viewport.
 */
function Cluster({ year, city, company, companyText, open, onToggle }: { year: string; city: Logo; company?: Logo; companyText?: string; open: boolean; onToggle: () => void }) {
  const cx = `calc((100% - ${CLUSTER_GAP}) / 3 + ${CLUSTER_GAP} / 2)`; // end of the 1fr column + half the gap
  return (
    <div
      className="relative min-h-0"
      style={vars({
        flex: "0 0 var(--h)",
        width: "calc(3 * var(--h))",
        height: "var(--h)",
        minHeight: "var(--h)",
        "--btn": BTN,
        "--cut": "calc(var(--btn) / 2 + var(--corner-gap))",
        "--corner-gap": CORNER_GAP,
        "--cx": cx,
        "--cy": "50%",
      })}
    >
      <div className="cut relative z-[2] grid size-full grid-rows-2" style={{ gridTemplateColumns: "1fr 2fr", gap: CLUSTER_GAP }}>
        <div className="rect col-start-1 row-start-1 flex items-center justify-center font-medium leading-none whitespace-nowrap" style={{ fontFamily: '"Poppins", sans-serif', fontSize: "calc(var(--h) * 0.14)" }}>{year}</div>
        <div className="rect relative col-start-1 row-start-2 min-h-0">
          <LogoCentered logo={city} w="61%" h="47%" />
        </div>
        <div className="rect relative col-start-2 row-span-2 row-start-1 min-h-0">
          {company && <LogoCentered logo={company} />}
          {companyText && (
            <span className="absolute inset-0 flex items-center justify-center font-display leading-none tracking-wide" style={{ color: "rgb(186, 131, 52)", fontSize: "calc(var(--h) * 0.3)" }}>
              {companyText}
            </span>
          )}
        </div>
      </div>
      <PlusButton style={{ left: cx, top: "50%" }} open={open} onClick={onToggle} label={`${year} ${company?.alt ?? companyText ?? city.alt}`} />
    </div>
  );
}

/** Column 3 card: same format as a column 2 card (3h x h): a square (h x h) with a number + a 2h x h text rectangle,
 *  "+" between them. It does not stretch with the column. */
function Stat({ n, text, open, onToggle }: { n: string; text: string; open: boolean; onToggle: () => void }) {
  const cx = "0px"; // the button is centred on the left edge of the card: the card starts at the middle of the button
  return (
    <div
      className="relative min-h-0"
      style={vars({
        flex: "0 0 var(--h)",
        width: "calc(3 * var(--h))",
        height: "var(--h)",
        "--btn": BTN,
        "--cut": "calc(var(--btn) / 2 + var(--stat-corner-gap))",
        "--stat-corner-gap": STAT_CORNER_GAP,
        "--cx": cx,
        "--cy": "50%",
      })}
    >
      <div className="cut size-full">
        <div
          className="rect flex size-full items-center leading-relaxed text-neutral-700"
          style={{
            fontSize: "calc(var(--h) * 0.115)",
            paddingLeft: "calc(var(--cut) + var(--h) * 0.08)",
            paddingRight: "calc(var(--h) * 0.1)",
          }}
        >
          {text}
        </div>
      </div>
      <PlusButton style={{ left: cx, top: "50%" }} open={open} onClick={onToggle} label={`${n} ${text}`} />
    </div>
  );
}

const cards: { year: string; city: Logo; company?: Logo; companyText?: string }[] = [
  { year: "2024", city: { src: madrid, alt: "Madrid" }, company: { src: tas, alt: "Thales Alenia Space" } },
  { year: "2023", city: { src: toulouse, alt: "Toulouse" }, companyText: "GROUPINVESTO" },
  { year: "2021", city: { src: toulouse, alt: "Toulouse" }, company: { src: orange, alt: "Orange" } },
  { year: "2019", city: { src: toulouse, alt: "Toulouse" }, company: { src: airbus, alt: "Airbus" } },
  { year: "2018", city: { src: paris, alt: "Paris" }, company: { src: familyandco, alt: "Family&Co" } },
];

/** Bullet of a detail panel: a string, or { label, text } with a bold label. */
function BulletItem({ b }: { b: Bullet }) {
  if (typeof b === "string") return <li>{b}</li>;
  return (
    <li>
      <span className="font-medium text-neutral-900">{b.label}</span>
      {b.text ? <>: {b.text}</> : null}
    </li>
  );
}

/** Code with an optional switch between several versions (e.g. Power Query M / Python). Comments are tinted. */
const COMMENT_MARKERS: Record<CodeTab["language"], string[]> = { m: ["//"], python: ["#"], dax: ["--", "//"], r: ["#"], sas: ["/*"] };
function splitComment(line: string, markers: string[]): [string, string] {
  let inString = false;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') inString = !inString;
    if (!inString && markers.some((m) => line.startsWith(m, i))) return [line.slice(0, i), line.slice(i)];
  }
  return [line, ""];
}
function CodeBlock({ tabs, caption }: { tabs: CodeTab[]; caption?: string }) {
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const tab = tabs[active];
  const markers = COMMENT_MARKERS[tab.language];
  const copy = () => {
    navigator.clipboard?.writeText(tab.source).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    });
  };
  return (
    <figure>
      <div className="flex items-center justify-between bg-neutral-900/[0.1]" style={{ padding: "0.3em 0.5em" }}>
        <div className="flex gap-[0.3em]" role="tablist" aria-label="Language">
          {tabs.map((t, i) => (
            <button
              key={t.label}
              type="button"
              role="tab"
              aria-selected={i === active}
              onClick={() => setActive(i)}
              className={`cursor-pointer font-medium transition-colors ${i === active ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-900/10"}`}
              style={{ padding: "0.25em 0.7em", fontSize: "0.85em" }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button type="button" onClick={copy} className="cursor-pointer text-neutral-500 transition-colors hover:text-neutral-900" style={{ fontSize: "0.8em" }}>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre key={active} className="scroll-col overflow-x-auto bg-neutral-900/[0.06] font-mono leading-[1.55] text-neutral-800" style={{ padding: "0.9em", fontSize: "0.78em", maxHeight: "30em", overflowY: "auto" }}>
        <code>
          {tab.source.split("\n").map((line, i) => {
            const [code, comment] = splitComment(line, markers);
            return (
              <div key={i} className="whitespace-pre">
                {code}
                {comment && <span className="text-emerald-800/80">{comment}</span>}
                {!code && !comment ? " " : null}
              </div>
            );
          })}
        </code>
      </pre>
      {caption && <figcaption className="text-neutral-500" style={{ marginTop: "0.5em", fontSize: "0.85em" }}>{caption}</figcaption>}
    </figure>
  );
}

/** One block of a detail panel section. */
function BlockView({ blk, onZoom }: { blk: Block; onZoom: (img: { src: string; alt: string }) => void }) {
  if (typeof blk === "string") return <p>{blk}</p>;
  if ("bullets" in blk) {
    return (
      <ul className="list-disc space-y-[0.4em] marker:text-neutral-400" style={{ paddingLeft: "1.25em" }}>
        {blk.bullets.map((bl, k) => <BulletItem key={k} b={bl} />)}
      </ul>
    );
  }
  if ("stats" in blk) {
    return (
      <dl className="grid grid-cols-2 gap-[0.7em]">
        {blk.stats.map((st) => (
          <div key={st.label} className="bg-neutral-900/[0.06]" style={{ padding: "0.7em 0.8em" }}>
            <dt className="font-num leading-none text-neutral-900" style={{ fontSize: "2.1em" }}>{st.value}</dt>
            <dd className="text-neutral-600" style={{ marginTop: "0.35em", fontSize: "0.85em", lineHeight: 1.3 }}>{st.label}</dd>
          </div>
        ))}
      </dl>
    );
  }
  if ("image" in blk) {
    const { src, alt, caption } = blk.image;
    return (
      <figure>
        <button type="button" onClick={() => onZoom({ src, alt })} aria-label={`Enlarge: ${alt}`} className="block w-full cursor-zoom-in">
          <img src={src} alt={alt} className="w-full" />
        </button>
        {caption && <figcaption className="text-neutral-500" style={{ marginTop: "0.5em", fontSize: "0.85em" }}>{caption}</figcaption>}
      </figure>
    );
  }
  if ("table" in blk) {
    const { head, rows, caption } = blk.table;
    return (
      <figure>
        <table className="w-full border-collapse text-left" style={{ fontSize: "0.88em" }}>
          <thead>
            <tr className="bg-neutral-900/[0.1]">
              {head.map((h) => <th key={h} className="font-medium text-neutral-900" style={{ padding: "0.4em 0.6em" }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-neutral-900/10">
                {r.map((c, j) => <td key={j} style={{ padding: "0.35em 0.6em" }}>{c}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
        {caption && <figcaption className="text-neutral-500" style={{ marginTop: "0.5em", fontSize: "0.85em" }}>{caption}</figcaption>}
      </figure>
    );
  }
  return <CodeBlock tabs={blk.code.tabs} caption={blk.code.caption} />;
}

type ZoomFn = (img: { src: string; alt: string }) => void;

/** Content of a detail panel (shared by the desktop slide-in panel and the mobile inline panel). */
function PanelBody({ detail, index, onZoom, className, style }: { detail: Detail; index: number; onZoom: ZoomFn; className?: string; style?: CSSProperties }) {
  return (
    <div key={index} className={className} style={style}>
      <p className="font-num uppercase tracking-wider text-neutral-500" style={{ fontSize: "1.25em" }}>{detail.kicker}</p>
      <h3 className="font-display leading-[1.02]" style={{ fontSize: "calc(var(--h) * 0.36)", marginTop: "0.35em" }}>{detail.title}</h3>
      <p className="font-medium text-neutral-800" style={{ marginTop: "0.5em", fontSize: "1.15em" }}>{detail.subtitle}</p>
      <hr className="border-neutral-900/15" style={{ margin: "1.3em 0" }} />
      {detail.sections.map((sec, i) => (
        <section key={i} style={{ marginTop: i === 0 ? 0 : sec.eyebrow ? "2.4em" : "1.7em" }}>
          {sec.eyebrow && (
            <p className="font-num uppercase tracking-wider text-neutral-500" style={{ fontSize: "1.1em", marginBottom: "0.3em" }}>{sec.eyebrow}</p>
          )}
          {sec.heading && <h4 className="font-semibold leading-snug text-neutral-900" style={{ fontSize: "1.1em", marginBottom: "0.55em" }}>{sec.heading}</h4>}
          <div className="space-y-[0.9em] leading-relaxed text-neutral-700">
            {sec.blocks.map((blk, j) => <BlockView key={j} blk={blk} onZoom={onZoom} />)}
          </div>
        </section>
      ))}
      {detail.images && detail.images.length > 0 && (
        <div className="grid gap-[0.8em]" style={{ marginTop: "2em" }}>
          {detail.images.map((src, i) => <img key={i} src={src} alt="" className="aspect-video w-full object-cover" />)}
        </div>
      )}
    </div>
  );
}

/** One detail panel (desktop). It has the same height as the other columns and scrolls inside if the content is long. */
function DetailPanel({ detail, index, hidden, x, label, onZoom }: { detail: Detail; index: number; hidden: boolean; x: string; label: string; onZoom: ZoomFn }) {
  return (
    <aside
      aria-label={label}
      aria-hidden={hidden}
      data-hidden={hidden}
      className="slot panel-slot rect"
      style={vars({ "--x": x, width: "var(--panel-w)" })}
    >
      <PanelBody
        detail={detail}
        index={index}
        onZoom={onZoom}
        className="panel-content scroll-col size-full overflow-y-auto"
        style={{ padding: "calc(var(--h) * 0.2)", fontSize: "calc(var(--h) * 0.12)" }}
      />
    </aside>
  );
}

const STACK_COLS = 4;
/** false: logos are grey, like the original Vengeance UI StackedLogos. true: keep the files' own colours. */
const COLOR_LOGOS = true;

/**
 * One stack cell content: logo, logo + name, or just the name (no logo, or file not added yet).
 * Every logo sits in the same box (13.8cqw x 5cqw, about 58 x 21px in a 84px cell) so that all of
 * them keep the same breathing room as "PL-SQL": wide logos are width-limited, square ones height-limited.
 * The images are wrapped in a span on purpose: the component only greys/resizes direct <img> children.
 */
function StackItem({ tool }: { tool: StackTool }) {
  const src = tool.mode === "text" ? undefined : logoUrl(tool);
  if (!src) {
    return <span className="whitespace-nowrap font-medium text-neutral-800" style={{ fontSize: "2.8cqw" }}>{tool.name}</span>;
  }
  const imgClass = `size-full object-contain ${COLOR_LOGOS ? "" : "grayscale brightness-50"}`;
  if (tool.mode === "logo+text") {
    const [first, ...rest] = tool.name.split(" ");
    return (
      <span className="flex items-center justify-center font-medium text-neutral-800" style={{ gap: "0.9cqw", fontSize: "2.4cqw" }}>
        <span className="flex shrink-0 items-center justify-center" style={{ height: "4.6cqw", maxWidth: "6cqw" }}>
          <img src={src} alt="" draggable={false} className={`h-full w-auto max-w-full object-contain ${COLOR_LOGOS ? "" : "grayscale brightness-50"}`} />
        </span>
        {tool.wrap && rest.length ? (
          <span className="flex flex-col text-left leading-[1.05]"><span>{first}</span><span>{rest.join(" ")}</span></span>
        ) : (
          <span className="whitespace-nowrap">{tool.name}</span>
        )}
      </span>
    );
  }
  return (
    <span className="block" style={{ width: "13.8cqw", height: "5cqw" }}>
      <img src={src} alt={tool.name} draggable={false} className={imgClass} />
    </span>
  );
}

/**
 * One line of the stacked-logos grid: STACK_COLS cells, each cycling through its own logos.
 * `sizes` = how many logos each cell holds; the logos are dealt out round-robin so the first ones
 * of the line are the ones visible together at the start.
 */
function toGroups(tools: StackTool[], sizes: number[]) {
  const cells: StackTool[][] = sizes.map(() => []);
  let k = 0;
  while (k < tools.length) {
    for (let c = 0; c < cells.length && k < tools.length; c++) {
      if (cells[c].length < sizes[c]) cells[c].push(tools[k++]);
    }
  }
  return cells.map((cell) => cell.map((t) => <StackItem key={t.name} tool={t} />));
}
const ROW_SIZES = [[3, 2, 3, 2], [2, 3, 2, 3]]; // 10 logos per line
const stackRows = [STACK.slice(0, 10), STACK.slice(10, 20)].map((row, i) => toGroups(row, ROW_SIZES[i]));

const ROLES = ["ANALYST", "ENGINEER", "SCIENTIST"];

/**
 * "ANALYST" -> "ENGINEER" -> "SCIENTIST" blur-morph (Vengeance UI MorphText).
 * The invisible stack of the three words gives the slot the width of the longest one,
 * so the line never reflows and the fit-to-column sizing accounts for "SCIENTIST".
 */
function RoleMorph() {
  return (
    <span className="relative inline-grid">
      {ROLES.map((r) => (
        <span key={r} aria-hidden="true" className="invisible col-start-1 row-start-1">{r}</span>
      ))}
      <span aria-hidden="true" className="absolute inset-0">
        <MorphText
          words={ROLES}
          interval={3000}
          align="start"
          minWidth="0"
          fontWeight={400}
          fontSize="inherit"
          fontFamily="inherit"
          className="size-full items-stretch justify-center"
        />
      </span>
      <span className="sr-only">Analyst, Engineer, Scientist</span>
    </span>
  );
}

const blocks = [
  { title: "5+ years of international experience...", items: ["In various industries", "& major corporate clients", "Working with cross-functional teams", "In multiple departments"] },
  { title: "...Spent honing my skills...", items: ["Collaborating with stakeholders at all levels", "Demystifying complex data issues", "In 3 languages"] },
  { title: "...And expanding my stack", items: [] as string[], stack: true },
];

type View = { kind: "exp" | "proj"; i: number } | null;

function DesktopApp() {
  const grid = useRef<HTMLDivElement>(null);
  const signature = useRef<HTMLDivElement>(null);
  const probe = useRef<HTMLDivElement>(null);
  useTitleLayout(grid);
  const tablet = useMediaQuery(TABLET_QUERY);
  useClosedZoom(grid, probe, !tablet);
  useFit(signature, 0.09);

  // Which detail panel is open (none, one experience card of column 2, or one card of column 3). One at a time:
  // clicking another "+" switches the panel, clicking the open "-" closes it.
  const [view, setView] = useState<View>(null);
  const [zoom, setZoom] = useState<{ src: string; alt: string } | null>(null); // enlarged image
  const [animating, setAnimating] = useState(false);
  const timer = useRef<number>(0);
  const toggle = (kind: "exp" | "proj", i: number) => {
    setAnimating(true); // transitions only run for ~2 s after a click (so resizing the window never animates)
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setAnimating(false), 2000);
    setView((v) => (v && v.kind === kind && v.i === i ? null : { kind, i }));
  };
  useEffect(() => {
    // Escape closes the enlarged image first, then the open panel
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (zoom) setZoom(null);
      else setView(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoom]);
  // keep showing the last content while a panel fades out
  const lastExp = useRef(0);
  const lastProj = useRef(0);
  if (view?.kind === "exp") lastExp.current = view.i;
  if (view?.kind === "proj") lastProj.current = view.i;

  const mode = view?.kind ?? "closed";
  // x position of every column, from the left edge of the composition. Column 1 slides out to the left when a
  // panel opens; the panel takes exactly column 1's width, so the composition never changes size:
  //   closed: [col 1][col 2][col 3]      exp: [col 2][panel][col 3]      proj: [col 2][col 3][panel]
  const gap = "var(--gap)";
  // tablet: the [column][panel] pair is a little narrower than the closed composition, so it is centred
  const tabOff = `calc((${CLOSEDK} - 3 - ${GAPK} - ${PANELK}) * var(--h) / 2)`;
  const x = {
    col1: mode === "closed" ? "var(--off)" : `calc(-1 * (var(--w1) + ${gap}))`,
    col2: mode === "closed" ? `calc(var(--off) + var(--w1) + ${gap})` : tablet && mode === "proj" ? `calc(-1 * (var(--card-w) + ${gap}))` : tablet ? tabOff : "0px",
    panelExp: tablet ? `calc(${tabOff} + var(--card-w) + ${gap})` : `calc(var(--card-w) + ${gap})`,
    col3: tablet && mode === "proj" ? tabOff : tablet && mode === "exp" ? `calc(var(--card-w) + var(--panel-w) + 2 * ${gap})` : mode === "proj" ? `calc(var(--card-w) + ${gap})` : mode === "exp" ? `calc(var(--card-w) + var(--panel-w) + 2 * ${gap})` : `calc(var(--off) + var(--w1) + var(--card-w) + 2 * ${gap})`,
    panelProj: tablet ? `calc(${tabOff} + var(--card-w) + ${gap})` : `calc(2 * var(--card-w) + 2 * ${gap})`,
  };
  const expDetail = experienceDetails[cards[lastExp.current].year];
  const projDetail = projectDetails[lastProj.current];

  return (
    <main className="relative flex h-screen items-center justify-center overflow-hidden">
      {/* Animated rays: top of the page only */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[70vh] [mask-image:linear-gradient(to_bottom,#000_55%,transparent)]">
        <AnimatedRays />
      </div>

      {/*
        Shared sizes:
        --h      height of one card (columns 2 and 3 cards are 3h x h)
        --title  shared font size of the column 1 titles and "Projects" (set by useTitleLayout so the
                 first column 1 title fills its column; leading-none, so it is also their height)
      */}
      <div
        ref={grid}
        className={`relative z-10 shrink-0 ${animating ? "animating" : ""}`}
        style={vars({
          "--pad-x": "clamp(1.25rem, calc(13.3vw - 82px), 5.5rem)", // minimum margin left and right: 20px at 768px wide, growing to 88px from 1280px wide
          "--pad-y": "6.5rem", // minimum margin above and below it
          "--card-gap": "16px", // vertical gap between two column 2 cards
          "--w1k": String(W1K),
          "--totalk": String(tablet ? CLOSEDK : TOTALK),
          "--panelk": String(PANELK),
          "--gapk": String(GAPK),
          // h = card height, with no fixed maximum: the largest value for which BOTH are true
          //  - the 5 cards of column 2 + their gaps fit between the top and bottom margins,
          //  - the whole composition (column 1 + 2 cards columns + 2 gaps = (w1k + 6 + 2*gapk) x h) fits the window width.
          "--h": "min(calc((100vh - 2 * var(--pad-y) - 4 * var(--card-gap)) / 5), calc((100vw - 2 * var(--pad-x)) / var(--totalk)))",
          "--w1": "calc(var(--w1k) * var(--h))", // column 1 and detail panels
          "--card-w": "calc(3 * var(--h))", // columns 2 and 3
          "--panel-w": "calc(var(--panelk) * var(--h))", // detail panels: two columns wide
          "--off": "calc((var(--totalk) - var(--w1k) - 6 - 2 * var(--gapk)) * var(--h) / 2)", // centres the closed layout in the widest one
          "--gap": "calc(var(--gapk) * var(--h))", // between two columns
          "--hc": "min(calc((100vh - 2 * var(--pad-y) - 4 * var(--card-gap)) / 5), calc((100vw - 2 * var(--pad-x)) / var(--closedk)))", // card height that the closed composition could have
          "--closedk": String(CLOSEDK),
          transformOrigin: "center",
          transform: mode === "closed" ? "scale(var(--k, 1))" : "none",
          transition: animating ? "transform 0.9s cubic-bezier(0.65, 0, 0.2, 1) var(--d-cols)" : "none",
          // all the columns have the height of the column 2 stack (5 cards + 4 gaps); <main> centres it vertically,
          // so nothing in the other columns can be above the first card or below the last one
          height: "calc(5 * var(--h) + 4 * var(--card-gap))",
          width: "calc(var(--totalk) * var(--h))",
          // timing: when opening, columns move first and the panel is revealed afterwards; when closing, the panel
          // goes first and the columns come back afterwards
          "--d-cols": mode === "closed" ? "0.25s" : "0s",
          "--d-panel": "0.5s",
        })}
      >
        {/* Column 1 */}
        <section className="slot col-slot flex min-h-0 flex-col justify-between" data-hidden={mode !== "closed"} style={vars({ "--x": x.col1, width: "var(--w1)" })}>
          {blocks.map((b) => (
            <div key={b.title}>
              <h2 data-title-col1 className="title w-max whitespace-nowrap font-display leading-none">{b.title}</h2>
              {b.stack ? (
                <div className="w-3/4" style={{ marginTop: "calc(var(--title, 2.25rem) * 0.8)" }}>
                  {stackRows.map((groups, i) => (
                    <StackedLogos
                      key={i}
                      logoGroups={groups}
                      logoWidth={`${100 / STACK_COLS}%`}
                      duration={12}
                      itemDuration={6}
                      stagger={i === 0 ? 4 : 7}
                      className={`[--cell-py:3.6cqw] [--cell-px:0.45cqw] [--logo-h:11.6cqw] ${i > 0 ? "-mt-px" : ""}`}
                    />
                  ))}
                </div>
              ) : (
                <ul
                  data-bullets
                  className="list-disc space-y-[0.5em] whitespace-nowrap text-neutral-700 marker:text-neutral-400"
                  style={{ fontSize: "var(--bullet, 0.9rem)", paddingLeft: "1.5em", marginTop: "calc(var(--title, 2.25rem) * 0.8)" }}
                >
                  {b.items.map((i) => <li key={i}>{i}</li>)}
                </ul>
              )}
            </div>
          ))}
        </section>

        {/* Column 2: the 5 experience cards (any extra card scrolls inside) */}
        <section
          aria-label="Selected work"
          className="slot col-slot scroll-col flex flex-col overflow-y-auto"
          data-hidden={tablet && mode === "proj"}
          style={vars({ "--x": x.col2, width: "var(--card-w)", gap: "var(--card-gap)" })}
        >
          {cards.map((c, i) => (
            <Cluster key={c.year} {...c} open={view?.kind === "exp" && view.i === i} onToggle={() => toggle("exp", i)} />
          ))}
        </section>

        {/* Detail panel of the experience cards: appears between column 2 and column 3 */}
        <DetailPanel detail={expDetail} index={lastExp.current} hidden={mode !== "exp"} x={x.panelExp} label="Experience details" onZoom={setZoom} />

        {/* Column 3 */}
        <section
          className="slot col-slot flex min-h-0 flex-col"
          data-hidden={tablet && mode === "exp"}
          style={vars({ "--x": x.col3, width: "var(--card-w)", gap: "calc(var(--h) * 0.26)" })}
        >
          <h2 className="title font-display leading-none">Projects</h2>
          <Stat n="1" text="4-week live chat analysis" open={view?.kind === "proj" && view.i === 0} onToggle={() => toggle("proj", 0)} />
          <Stat n="2" text={"Hotel guest analysis in R\u00a0&\u00a0SAS"} open={view?.kind === "proj" && view.i === 1} onToggle={() => toggle("proj", 1)} />
          <div ref={signature} className="mt-auto flex flex-col" style={{ gap: "calc(var(--h) * 0.26)" }}>
            <p className="font-medium" style={{ fontSize: "calc(var(--h) * 0.2)" }}>Habib <br/> HAMMARLEBIOD</p>
            <FitTitle>DATA <RoleMorph /></FitTitle>
            <SocialFlipButton email={CONTACT_EMAIL} />
          </div>
        </section>

        {/* Detail panel of the column 3 cards: appears after column 3 */}
        <DetailPanel detail={projDetail} index={lastProj.current} hidden={mode !== "proj"} x={x.panelProj} label="Project details" onZoom={setZoom} />
        <div ref={probe} aria-hidden className="pointer-events-none invisible absolute left-0 top-0 h-0" style={{ width: "var(--hc)" }} />
      </div>

      <Lightbox zoom={zoom} onClose={() => setZoom(null)} />
    </main>
  );
}

/** Enlarged image (click or Escape to close) */
function Lightbox({ zoom, onClose }: { zoom: { src: string; alt: string } | null; onClose: () => void }) {
  if (!zoom) return null;
  return (
    <div className="lightbox fixed inset-0 z-50 grid cursor-zoom-out place-items-center bg-neutral-900/80 p-6" role="dialog" aria-modal="true" aria-label={zoom.alt} onClick={onClose}>
      <img src={zoom.src} alt={zoom.alt} className="lightbox-img max-h-full max-w-full bg-white shadow-2xl" />
    </div>
  );
}

/* ===================== MOBILE (phone width) =====================
 * The three columns follow each other vertically as one single column: signature (name, role, contact) first,
 * then column 1, column 2 and column 3. A "+" opens its description inline, sliding down right under the card.
 * Every size is still a multiple of --h (card height), with 3h = the width of the screen minus its margins. */
const MOBILE_QUERY = "(max-width: 767px)";
function useMediaQuery(query: string) {
  const [m, setM] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setM(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return m;
}
const useIsMobile = () => useMediaQuery(MOBILE_QUERY);

/** Description that slides open under its card (height animates from 0 to its content). */
function InlinePanel({ open, detail, index, label, onZoom }: { open: boolean; detail: Detail; index: number; label: string; onZoom: ZoomFn }) {
  const [shown, setShown] = useState(open); // render the content once opened, keep it for the closing slide
  useEffect(() => { if (open) setShown(true); }, [open]);
  return (
    <div className="inline-panel" data-open={open} aria-hidden={!open}>
      <div className="min-h-0 overflow-hidden">
        {shown && (
          <aside aria-label={label} className="rect" style={{ marginTop: "var(--card-gap)" }}>
            <PanelBody detail={detail} index={index} onZoom={onZoom} className="panel-content-m" style={{ padding: "calc(var(--h) * 0.16)", fontSize: "calc(var(--h) * 0.125)" }} />
          </aside>
        )}
      </div>
    </div>
  );
}

function MobileApp() {
  const signature = useRef<HTMLDivElement>(null);
  useFit(signature, 0.2);
  const [view, setView] = useState<View>(null);
  const [zoom, setZoom] = useState<{ src: string; alt: string } | null>(null);
  const toggle = (kind: "exp" | "proj", i: number, id: string) => {
    const opening = !(view && view.kind === kind && view.i === i);
    setView(opening ? { kind, i } : null);
    if (opening) window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setZoom(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <main className="relative overflow-x-hidden" style={vars({ "--pad": "6.5vw", "--card-gap": "16px", "--h": "calc((100vw - 2 * var(--pad)) / 3)", "--title": "calc(var(--h) * 0.3)", "--bullet": "calc(var(--h) * 0.142)", "--card-w": "calc(3 * var(--h))", padding: "var(--pad)", paddingBottom: "calc(var(--pad) * 3)" })}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[60vh] [mask-image:linear-gradient(to_bottom,#000_55%,transparent)]">
        <AnimatedRays />
      </div>
      <div className="relative z-10 flex flex-col" style={{ gap: "calc(var(--h) * 0.5)" }}>
        {/* Signature on top of everything */}
        <div ref={signature} className="flex flex-col" style={{ gap: "calc(var(--h) * 0.16)", paddingTop: "calc(var(--h) * 0.2)" }}>
          <p className="font-medium" style={{ fontSize: "calc(var(--h) * 0.17)" }}>Habib HAMMARLEBIOD</p>
          <FitTitle>DATA <RoleMorph /></FitTitle>
          <SocialFlipButton email={CONTACT_EMAIL} />
        </div>

        {/* Column 1 */}
        {blocks.map((b) => (
          <section key={b.title}>
            <h2 className="title font-display leading-none">{b.title}</h2>
            {b.stack ? (
              <div className="w-full" style={{ marginTop: "calc(var(--title) * 0.8)" }}>
                {stackRows.map((groups, i) => (
                  <StackedLogos key={i} logoGroups={groups} logoWidth={`${100 / STACK_COLS}%`} duration={12} itemDuration={6} stagger={i === 0 ? 4 : 7}
                    className={`[--cell-py:3.6cqw] [--cell-px:0.45cqw] [--logo-h:11.6cqw] ${i > 0 ? "-mt-px" : ""}`} />
                ))}
              </div>
            ) : (
              <ul className="list-disc space-y-[0.5em] text-neutral-700 marker:text-neutral-400" style={{ fontSize: "var(--bullet)", paddingLeft: "1.5em", marginTop: "calc(var(--title) * 0.8)" }}>
                {b.items.map((i) => <li key={i}>{i}</li>)}
              </ul>
            )}
          </section>
        ))}

        {/* Column 2 */}
        <section aria-label="Selected work" className="flex flex-col" style={{ gap: "var(--card-gap)" }}>
          {cards.map((c, i) => (
            <div key={c.year} id={`m-exp-${i}`} style={{ scrollMarginTop: "12px" }}>
              <Cluster {...c} open={view?.kind === "exp" && view.i === i} onToggle={() => toggle("exp", i, `m-exp-${i}`)} />
              <InlinePanel open={view?.kind === "exp" && view.i === i} detail={experienceDetails[c.year]} index={i} label="Experience details" onZoom={setZoom} />
            </div>
          ))}
        </section>

        {/* Column 3 */}
        <section className="flex flex-col" style={{ gap: "var(--card-gap)" }}>
          <h2 className="title font-display leading-none" style={{ marginBottom: "calc(var(--h) * 0.1)" }}>Projects</h2>
          {[
            { n: "1", text: "4-week live chat analysis" },
            { n: "2", text: "Hotel guest analysis in R\u00a0&\u00a0SAS" },
          ].map((p, i) => (
            <div key={p.n} id={`m-proj-${i}`} style={{ scrollMarginTop: "12px" }}>
              <Stat n={p.n} text={p.text} open={view?.kind === "proj" && view.i === i} onToggle={() => toggle("proj", i, `m-proj-${i}`)} />
              <InlinePanel open={view?.kind === "proj" && view.i === i} detail={projectDetails[i]} index={i} label="Project details" onZoom={setZoom} />
            </div>
          ))}
        </section>
      </div>
      <Lightbox zoom={zoom} onClose={() => setZoom(null)} />
    </main>
  );
}

export default function App() {
  return useIsMobile() ? <MobileApp /> : <DesktopApp />;
}
