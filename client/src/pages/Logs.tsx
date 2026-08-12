import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Terminal, CheckCircle2, XCircle, Clock, Cpu } from "lucide-react";

export default function LogsPage() {
  const { data: logs, isLoading } = trpc.career.listLogs.useQuery();

  if (isLoading) return <div className="text-center py-12 text-muted-foreground">Loading automation execution logs...</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center bg-card p-6 rounded-2xl border border-border/60 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Terminal className="w-6 h-6 text-primary" /> Workflow Automation Logs
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Execution history of scheduled background discovery runs, job fetches, and AI match evaluations (serving as the automated workflow pipeline).
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1 font-mono text-xs bg-muted flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-primary animate-pulse" /> Heartbeat Cron Active
        </Badge>
      </div>

      <div className="space-y-4">
        {logs?.map((log) => {
          const isSuccess = log.status === 'Success';
          return (
            <Card key={log.id} className="border-border/80 shadow-xs">
              <CardContent className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    {isSuccess ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-destructive" />
                    )}
                    <span className="font-semibold text-sm">
                      {isSuccess ? `Automated Run Completed (${log.jobsFound} jobs found)` : "Execution Failed"}
                    </span>
                    <Badge variant={isSuccess ? "secondary" : "destructive"} className="text-[10px]">
                      {log.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {log.details || log.errorMessage || "No additional details logged."}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono bg-muted/50 px-3 py-1.5 rounded-lg border border-border/40 whitespace-nowrap">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  {new Date(log.runTime).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {logs?.length === 0 && (
          <Card className="p-12 text-center">
            <CardContent className="space-y-3">
              <Terminal className="w-12 h-12 text-muted-foreground mx-auto opacity-40" />
              <h3 className="text-lg font-semibold">No automation logs yet</h3>
              <p className="text-sm text-muted-foreground">
                Trigger an automated discovery run from the dashboard to populate execution logs.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
