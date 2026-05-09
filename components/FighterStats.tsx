import type { FighterStat, StandRating } from "@/lib/types";

const axes = [
  { label: "Power", key: "power", labelX: 150, labelY: 28, anchor: "middle" },
  { label: "Speed", key: "speed", labelX: 245, labelY: 82, anchor: "start" },
  { label: "Range", key: "range", labelX: 245, labelY: 216, anchor: "start" },
  { label: "Defence", key: "defence", labelX: 150, labelY: 286, anchor: "middle" },
  { label: "Intelligent", key: "intelligent", labelX: 55, labelY: 216, anchor: "end" },
  { label: "Potential", key: "developmentPotential", labelX: 55, labelY: 82, anchor: "end" },
] as const;

type Accent = "cyan" | "lime";

export function FighterStats({
  fighterA,
  fighterB,
}: {
  fighterA: FighterStat;
  fighterB: FighterStat;
}) {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <StatCard fighter={fighterA} accent="cyan" />
      <StatCard fighter={fighterB} accent="lime" />
    </section>
  );
}

function StatCard({ fighter, accent }: { fighter: FighterStat; accent: Accent }) {
  const ratings = axes.map((axis) => getRating(fighter, axis.key));
  const values = ratings.map(ratingToValue);
  const polygon = values
    .map((value, index) => pointFor(index, value, 150, 150, 86))
    .join(" ");
  const stroke = accent === "cyan" ? "#67e8f9" : "#bef264";
  const fill =
    accent === "cyan" ? "rgba(103, 232, 249, 0.2)" : "rgba(190, 242, 100, 0.18)";

  return (
    <article className="battle-panel p-6">
      <header className="text-center">
        <p className="text-sm font-medium text-zinc-500">Stats</p>
        <h3 className="mt-1 text-2xl font-semibold text-white">{fighter.name}</h3>
      </header>

      <div className="mx-auto mt-5 max-w-[22rem]">
        <svg
          viewBox="0 0 300 300"
          role="img"
          aria-label={`${fighter.name} stat radar chart`}
          className="h-auto w-full overflow-visible"
        >
          <defs>
            <filter id={`glow-${accent}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {[0.25, 0.5, 0.75, 1].map((scale) => (
            <polygon
              key={scale}
              points={axes
                .map((_, index) => pointFor(index, scale, 150, 150, 86))
                .join(" ")}
              fill="none"
              stroke="rgba(255,255,255,0.13)"
              strokeWidth="1"
            />
          ))}

          {axes.map((_, index) => {
            const [x, y] = pointFor(index, 1, 150, 150, 86).split(",");
            return (
              <line
                key={index}
                x1="150"
                y1="150"
                x2={x}
                y2={y}
                stroke="rgba(255,255,255,0.11)"
              />
            );
          })}

          <polygon
            points={polygon}
            fill={fill}
            stroke={stroke}
            strokeWidth="3"
            filter={`url(#glow-${accent})`}
          />

          {values.map((value, index) => {
            const [x, y] = pointFor(index, value, 150, 150, 86).split(",").map(Number);
            return <circle key={axes[index].key} cx={x} cy={y} r="4.2" fill={stroke} />;
          })}

          {axes.map((axis, index) => (
            <g key={axis.key}>
              <text
                x={axis.labelX}
                y={axis.labelY}
                textAnchor={axis.anchor}
                className="fill-zinc-400 text-[11px] font-medium"
              >
                {axis.label}
              </text>
              <text
                x={axis.labelX}
                y={axis.labelY + 18}
                textAnchor={axis.anchor}
                className="fill-zinc-50 text-[17px] font-bold"
              >
                {displayRating(ratings[index])}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <p className="mx-auto mt-4 max-w-md text-center text-sm leading-6 text-zinc-400">
        {fighter.edge}
      </p>
    </article>
  );
}

function getRating(
  fighter: FighterStat,
  key: (typeof axes)[number]["key"],
): StandRating {
  if (key === "power" || key === "speed") {
    return scoreToRating(fighter[key]);
  }
  if (key === "range") return normalizeRating(fighter.range, fighter.tactics);
  if (key === "defence") return normalizeRating(fighter.defence, fighter.durability);
  if (key === "intelligent") return normalizeRating(fighter.intelligent, fighter.tactics);
  return normalizeRating(fighter.developmentPotential, fighter.chaos);
}

function normalizeRating(value: StandRating | undefined, fallback: number): StandRating {
  return value ?? scoreToRating(fallback);
}

function scoreToRating(score: number): StandRating {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 55) return "C";
  if (score >= 35) return "D";
  return "E";
}

function ratingToValue(rating: StandRating) {
  if (rating === "A" || rating === "Infinite" || rating === "Complete") return 1;
  if (rating === "B") return 0.8;
  if (rating === "C" || rating === "?") return 0.6;
  if (rating === "D") return 0.4;
  if (rating === "E") return 0.22;
  return 0.04;
}

function displayRating(rating: StandRating) {
  return rating === "Infinite" ? "∞" : rating;
}

function pointFor(
  index: number,
  scale: number,
  centerX: number,
  centerY: number,
  radius: number,
) {
  const angle = -Math.PI / 2 + (index * Math.PI * 2) / axes.length;
  const x = centerX + Math.cos(angle) * radius * scale;
  const y = centerY + Math.sin(angle) * radius * scale;
  return `${x},${y}`;
}
