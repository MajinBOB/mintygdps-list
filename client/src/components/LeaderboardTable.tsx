import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy } from "lucide-react";
import { getInitials } from "@/lib/initials";
import { getCountryFlag } from "@/lib/countries";
import { Link } from "wouter";
import type { User } from "@shared/schema";

type LeaderboardEntry = {
  user: User & { country?: string | null };
  points: number;
  completions: number;
  rank: number;
};

type LeaderboardTableProps = {
  entries: LeaderboardEntry[];
};

export function LeaderboardTable({ entries }: LeaderboardTableProps) {
  return (
    <div className="space-y-2">
      {entries.map((entry, index) => {
        const isTopThree = index < 3;
        const userInitials = getInitials(entry.user);
        const countryFlag = getCountryFlag(entry.user.country);
        
        return (
          <Link key={entry.user.id} href={`/player/${entry.user.id}`}>
            <a
              className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer ${
                isTopThree 
                  ? 'bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 hover-elevate' 
                  : 'bg-card hover-elevate'
              }`}
              data-testid={`row-leaderboard-${index}`}
            >
            <div className={`flex items-center justify-center w-12 h-12 rounded-lg font-display font-bold ${
              index === 0 
                ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white text-2xl'
                : index === 1
                ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-white text-xl'
                : index === 2
                ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white text-xl'
                : 'bg-muted text-muted-foreground'
            }`}>
              {index < 3 ? <Trophy className="h-6 w-6" /> : `#${entry.rank}`}
            </div>
            
            <Avatar className="h-10 w-10">
              <AvatarImage src={entry.user.profileImageUrl || undefined} className="object-cover" />
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold truncate" data-testid={`text-player-name-${index}`}>
                  {entry.user.username}
                </p>
                {countryFlag && <span className="text-lg" data-testid={`flag-country-${index}`}>{countryFlag}</span>}
              </div>
              <p className="text-sm text-muted-foreground">
                {entry.completions} completions
              </p>
            </div>
            
            <div className="text-right">
              <p className="text-2xl font-bold font-display text-primary" data-testid={`text-player-points-${index}`}>
                {entry.points}
              </p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Points</p>
            </div>
            </a>
          </Link>
        );
      })}
    </div>
  );
}
