"use client";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation"; // Para App Router

interface StatCardProps {
  index: number;
  title: string;
  count: number;
  stats: {
    label: string;
    value: string | number;
  }[];
  className?: string;
  textColor?: string;
  isPress: boolean;
  search?: any;
}

export function StatCard({
  index,
  title,
  count,
  stats,
  className,
  textColor = "text-white",
  isPress,
  search
}: StatCardProps) {
  const router = useRouter();
  const canPress = index !== 0 && isPress;

  const handleClick = () => {
    if (canPress) {
      if (search) {
        localStorage.setItem("selectedTab", JSON.stringify(search));
      }
      router.push(`/alertas`);
    }
  };

  return (
    <div
      className={cn("rounded-lg p-4", className, {
        "cursor-pointer hover:opacity-90 transition-opacity": canPress,
      })}
      onClick={canPress ? handleClick : undefined}
      role={canPress ? "button" : undefined}
      tabIndex={canPress ? 0 : undefined}
    >
      <h3 className={cn("font-medium mb-2", textColor)}>{title}</h3>
      <div className="flex items-end gap-1">
        <span className={cn("text-5xl font-bold", textColor)}>{count}</span>
        <span className={cn("text-sm mb-1", textColor)}>
          {stats[0]?.label === "nuevos" ? "nuevos" : "activos"}
        </span>
      </div>
      <div className="mt-2 space-y-1">
        {stats.map((stat, idx) => (
          <div key={idx} className="flex justify-between">
            <span className={cn("text-xs", textColor)}>
              {stat.value} {stat.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
