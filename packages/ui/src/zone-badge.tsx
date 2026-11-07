export type Zone = "shell" | "blog";

/** Shows which zone rendered the page. Same information as the `x-mfe-zone` response header, for the browser. */
export function ZoneBadge({ zone }: { zone: Zone }) {
  return (
    <span className="badge" data-zone={zone}>
      <span className="dot" aria-hidden="true" />
      served by: {zone}
    </span>
  );
}
