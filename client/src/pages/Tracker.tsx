import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Building2, MapPin, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const STAGES = ["Discovered", "Applied", "Interview", "Offer", "Rejected"] as const;

export default function TrackerPage() {
  const utils = trpc.useUtils();
  const { data: jobs, isLoading } = trpc.career.listJobs.useQuery();
  const updateStatusMutation = trpc.career.updateJobStatus.useMutation({
    onSuccess: () => {
      toast.success("Stage updated successfully!");
      utils.career.listJobs.invalidate();
      utils.career.getStats.invalidate();
    }
  });

  if (isLoading) return <div className="text-center py-12 text-muted-foreground">Loading application tracker...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Application Tracker Pipeline</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor your career applications through each stage from initial discovery to offer.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
        {STAGES.map((stage) => {
          const stageJobs = jobs?.filter(j => j.status === stage) || [];
          return (
            <div key={stage} className="bg-muted/30 rounded-xl p-4 border border-border/60 flex flex-col min-h-[550px]">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-border/60">
                <h3 className="font-semibold text-sm">{stage}</h3>
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-bold">
                  {stageJobs.length}
                </span>
              </div>

              <div className="space-y-3 flex-1">
                {stageJobs.map((job) => (
                  <Card key={job.id} className="border-border/80 shadow-xs hover:shadow-md transition-all bg-card">
                    <CardHeader className="p-3 pb-2 space-y-1">
                      <div className="flex justify-between items-start">
                        <Badge variant="outline" className="text-[10px] font-semibold py-0">
                          {job.track}
                        </Badge>
                        <span className="text-xs font-bold text-primary flex items-center gap-0.5">
                          <Sparkles className="w-3 h-3" /> {job.matchScore}%
                        </span>
                      </div>
                      <CardTitle className="text-sm font-semibold leading-tight">{job.title}</CardTitle>
                      <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-primary" /> {job.company}
                      </p>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 space-y-3">
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {job.location}
                      </div>

                      <div className="space-y-1 pt-2 border-t border-border/40">
                        <label className="text-[10px] font-semibold text-muted-foreground">Move Stage:</label>
                        <Select value={job.status} onValueChange={(val: any) => updateStatusMutation.mutate({ id: job.id, status: val })}>
                          <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Discovered">Discovered</SelectItem>
                            <SelectItem value="Applied">Applied</SelectItem>
                            <SelectItem value="Interview">Interview</SelectItem>
                            <SelectItem value="Offer">Offer</SelectItem>
                            <SelectItem value="Rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {stageJobs.length === 0 && (
                  <div className="h-32 flex items-center justify-center text-xs text-muted-foreground border border-dashed border-border/60 rounded-lg">
                    No jobs in {stage}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
