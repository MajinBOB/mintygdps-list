import { Badge } from "@/components/ui/badge";

type DifficultyBadgeProps = {
  difficulty: string;
};

const difficultyColors = {
  Easy: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  Medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  Hard: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  Insane: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  Extreme: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
};

export function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  const colorClass = difficultyColors[difficulty as keyof typeof difficultyColors] || difficultyColors.Medium;
  
  return (
    <Badge 
      className={`${colorClass} font-medium uppercase text-xs tracking-wide`}
      data-testid={`badge-difficulty-${difficulty.toLowerCase()}`}
    >
      {difficulty}
    </Badge>
  );
}
