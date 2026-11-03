import { useMemo } from "react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function LibraryChart({ songs }) {
  const data = useMemo(() => {
    const counts = new Map();
    songs.forEach((song) => {
      const key = song.song_key?.trim() || "—";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    return [...counts.entries()]
      .map(([key, count]) => ({ key, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [songs]);

  if (data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-xs text-muted-foreground">
        Add songs to see how the library is distributed across keys.
      </div>
    );
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
          <XAxis
            dataKey="key"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "hsl(215 20% 65%)", fontSize: 11, fontFamily: "monospace" }}
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "hsl(215 20% 65%)", fontSize: 11 }}
          />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            contentStyle={{
              background: "hsl(219 32% 8%)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
              fontSize: 12,
              color: "hsl(210 20% 98%)",
            }}
            formatter={(value) => [`${value} songs`, "Library"]}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={entry.key} fill={index === 0 ? "hsl(46 65% 52%)" : "hsl(46 65% 52% / 0.35)"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}