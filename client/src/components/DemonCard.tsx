import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DifficultyBadge } from "./DifficultyBadge";
import { Trophy, User, Star, Edit, Trash2, Play } from "lucide-react";
import { Link } from "wouter";
import { getYouTubeThumbnail } from "@/lib/pointSystem";
import type { Demon } from "@shared/schema";

type DemonCardProps = {
  demon: Demon;
  onEdit?: (demon: Demon) => void;
  onDelete?: (demon: Demon) => void;
  showActions?: boolean;
};

export function DemonCard({ demon, onEdit, onDelete, showActions = false }: DemonCardProps) {
  const thumbnailUrl = demon.videoUrl ? getYouTubeThumbnail(demon.videoUrl) : null;

  const cardContent = (
    <CardContent className="p-6">
      <div className="flex items-start justify-between gap-4">
        {/* Thumbnail */}
        {thumbnailUrl && (
          <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-secondary">
            <img
              src={thumbnailUrl}
              alt={demon.name}
              className="w-full h-full object-cover"
              data-testid={`img-thumbnail-${demon.id}`}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
              <Play className="h-6 w-6 text-white" />
            </div>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent text-white font-display font-bold text-xl">
              #{demon.position}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-bold text-xl truncate" data-testid={`text-demon-name-${demon.id}`}>
                {demon.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <User className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm text-muted-foreground truncate">by {demon.creator}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <DifficultyBadge difficulty={demon.difficulty} />
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="h-4 w-4 text-amber-500" />
              <span className="font-medium">{demon.points} pts</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Trophy className="h-4 w-4" />
              <span>{demon.completionCount} completions</span>
            </div>
          </div>
        </div>
        
        {showActions && (
          <div className="flex gap-2 flex-shrink-0">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onEdit?.(demon)}
              data-testid={`button-edit-demon-${demon.id}`}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onDelete?.(demon)}
              data-testid={`button-delete-demon-${demon.id}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </CardContent>
  );

  if (showActions) {
    return (
      <Card className="hover-elevate" data-testid={`card-demon-${demon.id}`}>
        {cardContent}
      </Card>
    );
  }

  return (
    <Link href={`/level-detail/${demon.id}`}>
      <a data-testid={`link-demon-${demon.id}`}>
        <Card className="hover-elevate cursor-pointer" data-testid={`card-demon-${demon.id}`}>
          {cardContent}
        </Card>
      </a>
    </Link>
  );
}
