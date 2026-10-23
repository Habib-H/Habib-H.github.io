/**
 * Logo files of the "stack" section.
 * Drop them in src/assets/logos/ (see the README.txt there): they are matched to the tools by
 * file name, ignoring case, punctuation and words like "logo" / "icon".
 */
const files = import.meta.glob("./assets/logos/*.{svg,png,webp}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

export type StackTool = {
  name: string;
  /** "logo": logo only · "logo+text": logo with the name next to it · "text": name only (no logo exists) */
  mode: "logo" | "logo+text" | "text";
  /** normalised file names that identify the logo */
  keys?: string[];
  /** logo+text only: put the words of the name on separate lines (keeps the cell compact) */
  wrap?: boolean;
};

export const STACK: StackTool[] = [
  { name: "Oracle", mode: "logo", keys: ["oracle"] },
  { name: "SQL Server", mode: "logo+text", wrap: true, keys: ["sqlserver", "microsoftsqlserver", "mssqlserver", "mssql"] },
  { name: "PostgreSQL", mode: "logo", keys: ["postgresql", "postgres"] },
  { name: "Dataiku DSS", mode: "logo", keys: ["dataiku", "dss"] },
  { name: "Talend", mode: "logo", keys: ["talend"] },
  { name: "Power BI", mode: "logo", keys: ["powerbi", "pbi"] },
  { name: "Qlik Sense", mode: "logo", keys: ["qliksense", "qlik"] },
  { name: "Python", mode: "logo", keys: ["python"] },
  { name: "SQL", mode: "text" },
  { name: "PL-SQL", mode: "logo+text", keys: ["plsql"] },
  { name: "DAX", mode: "text" },
  { name: "M", mode: "text" },
  { name: "R", mode: "logo", keys: ["r", "rlang", "rproject"] },
  { name: "SAS", mode: "logo", keys: ["sas"] },
  { name: "HTML", mode: "logo", keys: ["html", "html5"] },
  { name: "CSS", mode: "logo", keys: ["css", "css3"] },
  { name: "Javascript", mode: "logo", keys: ["javascript", "js"] },
  { name: "Django", mode: "logo", keys: ["django"] },
  { name: "Vue", mode: "logo", keys: ["vue", "vuejs"] },
  { name: "JWT", mode: "logo", keys: ["jwt", "jsonwebtoken"] },
];

const DECORATION = /(logo|icon|wordmark|official|color|colour|svg|png|webp)/g;
const entries = Object.entries(files).map(([path, url]) => {
  const base = (path.split("/").pop() ?? "").replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]/g, "");
  return { base, stripped: base.replace(DECORATION, ""), url };
});

/** Exact match first (short keys such as "r" or "sas" only match exactly), then "contains" for keys of 4+ letters. */
export function logoUrl(tool: StackTool): string | undefined {
  if (!tool.keys) return undefined;
  for (const k of tool.keys) {
    const hit = entries.find((e) => e.stripped === k || e.base === k);
    if (hit) return hit.url;
  }
  for (const k of tool.keys.filter((k) => k.length >= 4)) {
    const hit = entries.find((e) => e.base.includes(k));
    if (hit) return hit.url;
  }
  return undefined;
}

if (import.meta.env.DEV) {
  const missing = STACK.filter((t) => t.mode !== "text" && !logoUrl(t)).map((t) => t.name);
  if (missing.length) console.info("[stack] no logo file found yet for:", missing.join(", "), "- showing their names instead");
}
