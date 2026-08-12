import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Send, Calendar, Sparkles, RefreshCw, ArrowRight, CheckCircle2, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function DashboardHomePage() {
  const utils = trpc.useUtils();
  const { data: stats, isLoading: statsLoading } = trpc.career.getStats.useQuery();
  const { data: jobs, isLoading: jobsLoading } = trpc.career.listJobs.useQuery({ status: "Discovered" });
  const triggerDiscoveryMutation = trpc.career.triggerDiscovery.useMutation({
    onSuccess: (data) => {
      toast.success(`Discovery run complete! Found ${data.addedCount} new matching job vacancies.`);
      utils.career.listJobs.invalidate();
      utils.career.getStats.invalidate();
      utils.career.listLogs.invalidate();
    },
    onError: (err) => {
      toast.error(`Discovery run failed: ${err.message}`);
    }
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome & Action Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-primary/10 via-primary/5 to-card p-8 rounded-3xl border border-primary/20 shadow-sm">
        <div className="space-y-2">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 font-medium">
            LinkedIn-First Career Automation for Balaji Rajput
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, Balaji</h1>
          <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
            Your automated career pipeline is actively tracking Pharmaceutical QA and AI & Python engineering opportunities with intelligent AI match scoring.
          </p>
        </div>
        <Button
          onClick={() => triggerDiscoveryMutation.mutate()}
          disabled={triggerDiscoveryMutation.isPending}
          className="gap-2 shadow-lg hover:shadow-xl transition-all font-semibold px-6 py-6 h-auto"
        >
          <RefreshCw className={`w-4 h-4 ${triggerDiscoveryMutation.isPending ? 'animate-spin' : ''}`} />
          {triggerDiscoveryMutation.isPending ? "Running Automated Discovery..." : "Run Job Discovery Now"}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="border-border/80 shadow-xs hover:border-primary/40 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Jobs Tracked</CardTitle>
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary"><Briefcase className="w-5 h-5" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{statsLoading ? "..." : stats?.totalJobs}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> Across Pharma & AI tracks
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs hover:border-primary/40 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Applications Sent</CardTitle>
            <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-600"><Send className="w-5 h-5" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{statsLoading ? "..." : stats?.applied}</div>
            <p className="text-xs text-muted-foreground mt-1">Active application pipeline</p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs hover:border-primary/40 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Interviews Scheduled</CardTitle>
            <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-600"><Calendar className="w-5 h-5" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{statsLoading ? "..." : stats?.interviews}</div>
            <p className="text-xs text-muted-foreground mt-1">Interview & offer stage</p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs hover:border-primary/40 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Match Score</CardTitle>
            <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-600"><Sparkles className="w-5 h-5" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{statsLoading ? "..." : `${stats?.avgMatch}%`}</div>
            <p className="text-xs text-muted-foreground mt-1">Evaluated by built-in AI LLM</p>
          </CardContent>
        </Card>
      </div>

      {/* High Match Discovered Jobs Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Top Discovered Matches</h2>
            <p className="text-sm text-muted-foreground">Newly discovered vacancies sorted by AI match percentage.</p>
          </div>
          <Link href="/jobs" className="text-sm font-semibold text-primary flex items-center gap-1 hover:underline">
            View All Jobs <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {jobsLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading top matches...</div>
        ) : jobs?.length === 0 ? (
          <Card className="p-10 text-center bg-card">
            <CardContent className="space-y-3">
              <Sparkles className="w-10 h-10 text-primary mx-auto opacity-50" />
              <h3 className="font-semibold">No discovered jobs currently</h3>
              <p className="text-sm text-muted-foreground">Click "Run Job Discovery Now" above to fetch new vacancies.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {jobs?.slice(0, 3).map((job) => (
              <Card key={job.id} className="border-border/80 shadow-xs hover:border-primary/50 transition-all flex flex-col justify-between">
                <CardHeader className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Badge variant={job.track === 'Pharmaceutical' ? 'secondary' : 'default'} className="text-xs">
                      {job.track}
                    </Badge>
                    <Badge variant="outline" className="font-bold bg-emerald-500/10 text-emerald-700 border-emerald-500/20 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> {job.matchScore}% Match
                    </Badge>
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold leading-snug">{job.title}</CardTitle>
                    <p className="text-sm font-medium text-muted-foreground mt-1">{job.company}</p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>{job.location}</span> • <span className="font-medium text-foreground">{job.remoteEligibility}</span>
                  </div>
                  {job.matchExplanation && (
                    <p className="text-xs text-muted-foreground bg-muted/50 p-2.5 rounded-lg border border-border/40 line-clamp-3">
                      {job.matchExplanation}
                    </p>
                  )}
                  <div className="pt-2">
                    <Link href="/jobs">
                      <Button variant="outline" size="sm" className="w-full text-xs">Manage in Pipeline</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
