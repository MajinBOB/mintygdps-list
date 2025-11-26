import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "./StatusBadge";
import { ExternalLink, CheckCircle, XCircle } from "lucide-react";
import { getInitials } from "@/lib/initials";
import type { Record, User, Demon } from "@shared/schema";

type RecordCardProps = {
  record: Record & { user?: User; demon?: Demon };
  onApprove?: (record: Record) => void;
  onReject?: (record: Record) => void;
  showActions?: boolean;
};

export function RecordCard({ record, onApprove, onReject, showActions = false }: RecordCardProps) {
  const userInitials = record.user ? getInitials(record.user) : '?';

  return (
    <Card className="hover-elevate" data-testid={`card-record-${record.id}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-4 flex-1 min-w-0">
            <Avatar className="h-12 w-12">
              <AvatarImage src={record.user?.profileImageUrl || undefined} className="object-cover" />
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold truncate" data-testid={`text-record-user-${record.id}`}>
                  {record.user?.username || 'Unknown User'}
                </span>
                <StatusBadge status={record.status} />
              </div>
              
              <p className="text-sm text-muted-foreground mt-1">
                Demon: <span className="font-medium text-foreground">{record.demon?.name || 'Unknown'}</span>
              </p>
              
              <div className="flex items-center gap-2 mt-2">
                <a
                  href={record.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                  data-testid={`link-record-video-${record.id}`}
                >
                  <ExternalLink className="h-3 w-3" />
                  View Proof
                </a>
                <span className="text-sm text-muted-foreground">
                  • {new Date(record.submittedAt!).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          
          {showActions && record.status === 'pending' && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="default"
                onClick={() => onApprove?.(record)}
                data-testid={`button-approve-record-${record.id}`}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onReject?.(record)}
                data-testid={`button-reject-record-${record.id}`}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
