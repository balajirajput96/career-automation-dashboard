import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck, Sparkles, Clock } from "lucide-react";
import { toast } from "sonner";

export default function NotificationsPage() {
  const utils = trpc.useUtils();
  const { data: notifications, isLoading } = trpc.career.listNotifications.useQuery();
  const markReadMutation = trpc.career.markNotificationRead.useMutation({
    onSuccess: () => {
      utils.career.listNotifications.invalidate();
    }
  });

  if (isLoading) return <div className="text-center py-12 text-muted-foreground">Loading notifications...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center bg-card p-6 rounded-2xl border border-border/60 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" /> Notification & Alert Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Instant alerts for high-match job discoveries exceeding your threshold and critical application updates.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {notifications?.map((item) => (
          <Card key={item.id} className={`border-border/80 transition-all ${item.isRead ? 'bg-card opacity-85' : 'bg-primary/5 border-primary/30 shadow-xs'}`}>
            <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{item.title}</span>
                  {!item.isRead && <Badge variant="default" className="text-[10px]">New</Badge>}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.message}</p>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground pt-1">
                  <Clock className="w-3 h-3" /> {new Date(item.createdAt).toLocaleString()}
                </div>
              </div>
              {!item.isRead && (
                <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => markReadMutation.mutate({ id: item.id })}>
                  <CheckCheck className="w-3.5 h-3.5" /> Mark Read
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
        {notifications?.length === 0 && (
          <Card className="p-12 text-center">
            <CardContent className="space-y-3">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto opacity-40" />
              <h3 className="text-lg font-semibold">No notifications yet</h3>
              <p className="text-sm text-muted-foreground">
                You'll be alerted when high-match jobs are discovered or when interview requests arrive.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
