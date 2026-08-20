import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { User, Briefcase, Award, Settings, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const utils = trpc.useUtils();
  const { data: profile, isLoading } = trpc.career.getProfile.useQuery();

  const [fullName, setFullName] = useState("");
  const [headline, setHeadline] = useState("");
  const [summary, setSummary] = useState("");
  const [skills, setSkills] = useState("");
  const [experienceSummary, setExperienceSummary] = useState("");
  const [matchThreshold, setMatchThreshold] = useState(75);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || "");
      setHeadline(profile.headline || "");
      setSummary(profile.summary || "");
      setSkills(profile.skills || "");
      setExperienceSummary(profile.experienceSummary || "");
      setMatchThreshold(profile.matchThreshold || 75);
    }
  }, [profile]);

  const updateMutation = trpc.career.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile and AI match settings saved successfully!");
      utils.career.getProfile.invalidate();
    },
    onError: (err) => {
      toast.error(`Failed to update: ${err.message}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      fullName,
      headline,
      summary,
      skills,
      experienceSummary,
      matchThreshold,
    });
  };

  if (isLoading) return <div className="text-center py-12 text-muted-foreground">Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile & Resume Configuration</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Add your verified background and choose an AI match threshold for more accurate job scoring.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5 text-primary" /> Personal & Professional Identity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={fullName} onChange={e => setFullName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Professional Headline</Label>
                <Input value={headline} onChange={e => setHeadline(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Professional Summary</Label>
              <Textarea value={summary} onChange={e => setSummary(e.target.value)} rows={3} required />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="w-5 h-5 text-primary" /> Verified Skills & Experience Tracks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Skills & Competencies (Comma separated)</Label>
              <Textarea value={skills} onChange={e => setSkills(e.target.value)} rows={3} placeholder="Quality Assurance, IPQA, GMP, Python, AI Agents, RAG..." required />
            </div>
            <div className="space-y-2">
              <Label>Experience & Background Summary</Label>
              <Textarea value={experienceSummary} onChange={e => setExperienceSummary(e.target.value)} rows={4} placeholder="Detailed career history in pharmaceutical QA and AI automation..." required />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings className="w-5 h-5 text-primary" /> Notification & Match Threshold Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>High-Match Notification Threshold ({matchThreshold}%)</Label>
                <span className="text-sm font-bold text-primary">{matchThreshold}%</span>
              </div>
              <Slider
                value={[matchThreshold]}
                min={50}
                max={95}
                step={5}
                onValueChange={(vals) => setMatchThreshold(vals[0])}
              />
              <p className="text-xs text-muted-foreground">
                You will receive in-app notifications whenever newly discovered jobs meet or exceed this match score.
              </p>
            </div>

            <Button type="submit" className="w-full gap-2" disabled={updateMutation.isPending}>
              <CheckCircle className="w-4 h-4" /> {updateMutation.isPending ? "Saving Profile..." : "Save Profile & Match Settings"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
