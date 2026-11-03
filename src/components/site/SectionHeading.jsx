import { cn } from "@/lib/utils";

export function SectionHeading({ eyebrow, title, description, action, className, align = "left" }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "sm:flex-col sm:items-center sm:text-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow && (
          <div className={cn("flex items-center gap-3", align === "center" && "justify-center")}>
            <span className="h-px w-8 bg-primary/50" />
            <p className="eyebrow text-primary/80">{eyebrow}</p>
          </div>
        )}
        <h2 className="mt-4 font-display text-[clamp(1.9rem,3.6vw,2.9rem)] font-medium leading-[1.12] tracking-tight text-balance text-foreground">
          {title}
        </h2>
        {description && <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}