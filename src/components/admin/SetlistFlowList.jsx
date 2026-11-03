import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { GripVertical, Sparkles, Star, Trash2 } from "lucide-react";
import { MUSICAL_KEYS, themeFor } from "@/lib/song-theme";
import { cn } from "@/lib/utils";

const control =
  "rounded-lg border border-white/10 bg-background/60 px-2 py-1.5 font-mono text-xs text-foreground focus:border-primary/50 focus:outline-none";

function KeyBpm({ item, onUpdate }) {
  return (
    <div className="flex items-center gap-1.5">
      <select
        aria-label={`Key for ${item.song_title}`}
        value={item.song_key ?? ""}
        onChange={(e) => onUpdate({ song_key: e.target.value })}
        className={cn(control, "w-[62px]")}
      >
        <option value="">—</option>
        {MUSICAL_KEYS.map((key) => (
          <option key={key} value={key}>
            {key}
          </option>
        ))}
      </select>
      <input
        aria-label={`BPM for ${item.song_title}`}
        type="number"
        min={20}
        max={300}
        value={item.bpm ?? ""}
        onChange={(e) => onUpdate({ bpm: e.target.value === "" ? null : Number(e.target.value) })}
        className={cn(control, "w-[68px] text-center")}
        placeholder="BPM"
      />
    </div>
  );
}

export function SetlistFlowList({ items, closing, onReorder, onUpdate, onRemove, onSetClosing, onClearClosing }) {
  return (
    <div className="space-y-2">
      <DragDropContext onDragEnd={({ source, destination }) => onReorder(source.index, destination?.index)}>
        <Droppable droppableId="flow">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
              {items.length === 0 && (
                <div className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-xs text-muted-foreground">
                  Add songs from the library to build this Sunday&apos;s flow.
                </div>
              )}
              {items.map((item, index) => {
                const theme = themeFor(item.category);
                return (
                  <Draggable key={item.key} draggableId={item.key} index={index}>
                    {(dragProvided) => (
                      <div
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        className="flex flex-wrap items-center gap-2 rounded-xl border border-white/8 bg-white/[0.03] p-2.5 sm:flex-nowrap"
                      >
                        <span
                          {...dragProvided.dragHandleProps}
                          aria-label={`Reorder ${item.song_title}`}
                          className="cursor-grab rounded p-1 text-muted-foreground/60 hover:text-foreground active:cursor-grabbing"
                        >
                          <GripVertical className="h-4 w-4" />
                        </span>
                        <span className="w-5 shrink-0 font-mono text-xs text-muted-foreground">{index + 1}</span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm text-foreground">{item.song_title}</p>
                          <p className="truncate text-[10px] text-muted-foreground">
                            {item.artist || "—"} · {theme.label}
                          </p>
                        </div>
                        <KeyBpm item={item} onUpdate={(patch) => onUpdate(item.key, patch)} />
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onSetClosing(item.key)}
                            title="Use as closing song"
                            aria-label={`Make ${item.song_title} the closing song`}
                            className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-primary/10 hover:text-primary"
                          >
                            <Star className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onRemove(item.key)}
                            aria-label={`Remove ${item.song_title}`}
                            className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div className="pt-1">
        {closing ? (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-primary/30 bg-primary/[0.07] p-2.5 sm:flex-nowrap">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Sparkles className="h-3 w-3" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-sm text-foreground">
                {closing.song_title}
                <span className="rounded-full border border-primary/40 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.14em] text-primary">
                  Closing
                </span>
              </p>
              <p className="truncate text-[10px] text-muted-foreground">{closing.artist || "—"}</p>
            </div>
            <KeyBpm item={closing} onUpdate={(patch) => onUpdate(closing.key, patch)} />
            <button
              type="button"
              onClick={onClearClosing}
              aria-label="Clear closing song"
              className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-primary/20 px-4 py-3 text-center text-[11px] text-muted-foreground">
            Tap the star on a song to set it as the closing song.
          </div>
        )}
      </div>
    </div>
  );
}