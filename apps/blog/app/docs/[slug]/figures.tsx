// Diagrams for the docs. Colours follow the legend on /horizontal: shell = teal solid, blog = amber dashed.

export type FigureId = "likes-same-page" | "likes-between-pages";

const text = { fill: "var(--ink)", fontFamily: "var(--sans)" } as const;
const sub = { fill: "var(--muted)", fontFamily: "var(--sans)" } as const;

function Arrow({ id }: { id: string }) {
  return (
    <defs>
      <marker id={id} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </marker>
    </defs>
  );
}

type BoxProps = { x: number; y: number; w: number; h: number; zone: "shell" | "blog" | "neutral"; title: string; note?: string };

function Box({ x, y, w, h, zone, title, note }: BoxProps) {
  const stroke = zone === "shell" ? "var(--shell)" : zone === "blog" ? "var(--blog)" : "var(--line-strong)";
  const fill = zone === "shell" ? "var(--shell-tint)" : zone === "blog" ? "var(--blog-tint)" : "var(--panel)";
  const cy = note ? y + h / 2 - 10 : y + h / 2;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="6" fill={fill} stroke={stroke} strokeWidth="1.5" strokeDasharray={zone === "blog" ? "5 4" : undefined} />
      <text x={x + w / 2} y={cy} textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="600" style={text}>
        {title}
      </text>
      {note && (
        <text x={x + w / 2} y={y + h / 2 + 12} textAnchor="middle" dominantBaseline="central" fontSize="12" style={sub}>
          {note}
        </text>
      )}
    </g>
  );
}

function SamePage() {
  return (
    <svg viewBox="0 0 680 270" width="100%" role="img" aria-labelledby="fig-same-t fig-same-d">
      <title id="fig-same-t">One page, two apps, one context</title>
      <desc id="fig-same-d">
        On /horizontal the blog's Like button calls like() on the LikesProvider that the shell owns. The header badge, rendered by the shell, shows the new count at once. The
        blog's own LikesProvider is not used on this page.
      </desc>
      <Arrow id="fig-same-arrow" />
      <rect x="20" y="20" width="640" height="230" rx="10" fill="none" stroke="var(--line-strong)" strokeWidth="1" strokeDasharray="5 4" />
      <text x="40" y="46" fontSize="13" fontWeight="600" style={text}>
        /horizontal, a shell page (one page load, one React tree)
      </text>
      <Box x={50} y={70} w={240} h={64} zone="shell" title="Shell LikesProvider" note="holds the count in state" />
      <Box x={50} y={172} w={240} h={52} zone="shell" title="Header badge" />
      <Box x={380} y={70} w={250} h={64} zone="blog" title="Blog Like button" note="same module, via shared" />
      <rect x="380" y="172" width="250" height="52" rx="6" fill="none" stroke="var(--line-strong)" strokeWidth="1" strokeDasharray="4 3" />
      <text x="505" y="190" textAnchor="middle" dominantBaseline="central" fontSize="12" style={sub}>
        Blog LikesProvider
      </text>
      <text x="505" y="208" textAnchor="middle" dominantBaseline="central" fontSize="12" style={sub}>
        not used on this page
      </text>
      <line x1="378" y1="102" x2="292" y2="102" stroke="var(--blog)" strokeWidth="1.5" markerEnd="url(#fig-same-arrow)" />
      <text x="335" y="90" textAnchor="middle" fontSize="12" style={sub}>
        like()
      </text>
      <line x1="170" y1="136" x2="170" y2="170" stroke="var(--shell)" strokeWidth="1.5" markerEnd="url(#fig-same-arrow)" />
      <text x="182" y="158" fontSize="12" style={sub}>
        count
      </text>
    </svg>
  );
}

function BetweenPages() {
  return (
    <svg viewBox="0 0 680 290" width="100%" role="img" aria-labelledby="fig-pages-t fig-pages-d">
      <title id="fig-pages-t">Two pages share the count through localStorage</title>
      <desc id="fig-pages-d">
        A shell page and a blog page each have their own LikesProvider. Both read the mfe-lite:likes key from localStorage when they mount and write it when Like is pressed.
      </desc>
      <Arrow id="fig-pages-arrow" />
      <Box x={40} y={30} w={210} h={64} zone="shell" title="Shell page" note="LikesProvider holds count" />
      <Box x={430} y={30} w={210} h={64} zone="blog" title="Blog page" note="LikesProvider holds count" />
      <Box x={230} y={190} w={220} h={64} zone="neutral" title="localStorage" note="mfe-lite:likes" />
      <line x1="140" y1="96" x2="262" y2="188" stroke="var(--shell)" strokeWidth="1.5" markerStart="url(#fig-pages-arrow)" markerEnd="url(#fig-pages-arrow)" />
      <line x1="540" y1="96" x2="418" y2="188" stroke="var(--blog)" strokeWidth="1.5" markerStart="url(#fig-pages-arrow)" markerEnd="url(#fig-pages-arrow)" />
      <text x="40" y="150" fontSize="12" style={sub}>
        Like pressed: save
      </text>
      <text x="40" y="168" fontSize="12" style={sub}>
        Page mounts: load
      </text>
      <text x="640" y="150" textAnchor="end" fontSize="12" style={sub}>
        Like pressed: save
      </text>
      <text x="640" y="168" textAnchor="end" fontSize="12" style={sub}>
        Page mounts: load
      </text>
    </svg>
  );
}

export function Figure({ id, caption }: { id: FigureId; caption: string }) {
  return (
    <figure className="figure">
      {id === "likes-same-page" ? <SamePage /> : <BetweenPages />}
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
