import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Search, Plus, Sparkles, ExternalLink, Filter, MapPin, Building2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function JobsPage() {
  const [track, setTrack] = useState("All");
  const [status, setStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New job form state
  const [newTitle, setNewTitle] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newTrack, setNewTrack] = useState<"Pharmaceutical" | "AI & Python">("Pharmaceutical");
  const [newRemote, setNewRemote] = useState("Remote - India eligible");
  const [newUrl, setNewUrl] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const utils = trpc.useUtils();
  const { data: jobs, isLoading } = trpc.career.listJobs.useQuery({ track, status, search });
  const addJobMutation = trpc.career.addJob.useMutation({
    onSuccess: (data) => {
      toast.success(`Job added successfully! AI Match Score: ${data.matchScore}%`);
      setIsAddOpen(false);
      setNewTitle("");
      setNewCompany("");
      setNewLocation("");
      setNewUrl("");
      setNewDesc("");
      utils.career.listJobs.invalidate();
      utils.career.getStats.invalidate();
    },
    onError: (err) => {
      toast.error(`Failed to add job: ${err.message}`);
    }
  });

  const updateStatusMutation = trpc.career.updateJobStatus.useMutation({
    onSuccess: () => {
      toast.success("Application status updated!");
      utils.career.listJobs.invalidate();
      utils.career.getStats.invalidate();
    }
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newCompany || !newDesc || !newUrl) {
      toast.error("Please add the verified posting URL, title, company, and description.");
      return;
    }
    addJobMutation.mutate({
      title: newTitle,
      company: newCompany,
      location: newLocation || "Not publicly verified",
      track: newTrack,
      remoteEligibility: newRemote,
      jobUrl: newUrl,
      description: newDesc,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-2xl border border-border/60 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Job Discovery & Pipeline</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Explore curated vacancies across Pharmaceutical and AI & Python tracks with AI match scoring.
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-md">
              <Plus className="w-4 h-4" /> Add Custom Job
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Add Job Vacancy for AI Match Scoring</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddSubmit} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Job Title</Label>
                  <Input placeholder="e.g. QA Officer / Python Engineer" value={newTitle} onChange={e => setNewTitle(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input placeholder="e.g. Sun Pharma / OpenAI" value={newCompany} onChange={e => setNewCompany(e.target.value)} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input placeholder="e.g. Vadodara / Remote" value={newLocation} onChange={e => setNewLocation(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Career Track</Label>
                  <Select value={newTrack} onValueChange={(val: any) => setNewTrack(val)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pharmaceutical">Pharmaceutical</SelectItem>
                      <SelectItem value="AI & Python">AI & Python</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Remote Eligibility</Label>
                  <Input placeholder="e.g. India eligible / Worldwide" value={newRemote} onChange={e => setNewRemote(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Verified Job URL</Label>
                  <Input type="url" placeholder="https://linkedin.com/jobs/..." value={newUrl} onChange={e => setNewUrl(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Job Description (for AI Match Scoring)</Label>
                <Textarea placeholder="Paste full job description here..." rows={5} value={newDesc} onChange={e => setNewDesc(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={addJobMutation.isPending}>
                {addJobMutation.isPending ? "Scoring with Built-in AI..." : "Save & Score Job Match"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border border-border/60">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search title, company..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <Select value={track} onValueChange={setTrack}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Track" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Tracks</SelectItem>
              <SelectItem value="Pharmaceutical">Pharmaceutical</SelectItem>
              <SelectItem value="AI & Python">AI & Python</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="Discovered">Discovered</SelectItem>
              <SelectItem value="Applied">Applied</SelectItem>
              <SelectItem value="Interview">Interview</SelectItem>
              <SelectItem value="Offer">Offer</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Job Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading job vacancies...</div>
      ) : jobs?.length === 0 ? (
        <Card className="p-12 text-center">
          <CardContent className="space-y-3">
            <Sparkles className="w-12 h-12 text-primary mx-auto opacity-50" />
            <h3 className="text-lg font-semibold">No job vacancies found</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Run automated discovery from the dashboard or add a custom job vacancy to start tracking your pipeline.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs?.map((job) => {
            const scoreColor = job.matchScore >= 85 ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" : job.matchScore >= 75 ? "bg-blue-500/10 text-blue-700 border-blue-500/20" : "bg-amber-500/10 text-amber-700 border-amber-500/20";
            return (
              <Card key={job.id} className="flex flex-col justify-between border-border/80 hover:border-primary/50 transition-all shadow-sm">
                <CardHeader className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <Badge variant={job.track === 'Pharmaceutical' ? 'secondary' : 'default'} className="text-xs font-medium">
                      {job.track}
                    </Badge>
                    <Badge variant="outline" className={`font-bold ${scoreColor} flex items-center gap-1`}>
                      <Sparkles className="w-3 h-3" /> {job.matchScore}% Match
                    </Badge>
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold leading-snug">{job.title}</CardTitle>
                    <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground mt-1">
                      <Building2 className="w-4 h-4 text-primary" /> {job.company}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                    <span className="bg-muted px-2 py-0.5 rounded text-foreground font-medium">{job.remoteEligibility}</span>
                  </div>

                  {job.matchExplanation && (
                    <div className="bg-muted/50 p-3 rounded-lg text-xs leading-relaxed border border-border/40">
                      <span className="font-semibold text-foreground">AI Fit Analysis:</span> {job.matchExplanation}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-border/60">
                    <Select value={job.status} onValueChange={(val: any) => updateStatusMutation.mutate({ id: job.id, status: val })}>
                      <SelectTrigger className="w-[130px] h-8 text-xs font-medium"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Discovered">Discovered</SelectItem>
                        <SelectItem value="Applied">Applied</SelectItem>
                        <SelectItem value="Interview">Interview</SelectItem>
                        <SelectItem value="Offer">Offer</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <a href={job.jobUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline">
                      View Posting <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
