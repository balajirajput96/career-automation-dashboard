import { invokeLLM } from "./_core/llm";

export async function scoreJobWithAI(jobTitle: string, jobDescription: string, profileSummary: string, skills: string): Promise<{ matchScore: number; matchExplanation: string }> {
  try {
    const prompt = `You are an expert AI Career and Resume Matcher.
Candidate Profile:
- Name: Balaji Dilip Singh Rajput
- Background: Pharmaceutical Manufacturing / Quality Assurance (QA, IPQA, Tablet Compression, OSD, GMP, BMR review) & AI / Python / Automation Engineering.
- Profile Summary: ${profileSummary}
- Skills: ${skills}

Job Vacancy:
- Title: ${jobTitle}
- Description: ${jobDescription}

Evaluate how well this job matches the candidate's profile and skills.
Return ONLY valid JSON with keys:
- "matchScore": a number between 0 and 100 representing percentage match.
- "matchExplanation": a clear 2-3 sentence explanation detailing why it fits, key matched skills, and any gaps.`;

    const res = await invokeLLM({
      model: "gpt-5-mini",
      messages: [
        { role: "system", content: "You output valid JSON only." },
        { role: "user", content: prompt }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "job_match",
          strict: true,
          schema: {
            type: "object",
            properties: {
              matchScore: { type: "number" },
              matchExplanation: { type: "string" }
            },
            required: ["matchScore", "matchExplanation"],
            additionalProperties: false
          }
        }
      }
    });

    const msgContent = res.choices[0].message.content;
    const content = typeof msgContent === 'string' ? msgContent : JSON.stringify(msgContent);
    if (!content) throw new Error("No response content from LLM");
    const parsed = JSON.parse(content);
    return {
      matchScore: typeof parsed.matchScore === 'number' ? parsed.matchScore : 70,
      matchExplanation: parsed.matchExplanation || "Strong alignment with candidate background."
    };
  } catch (error) {
    console.error("AI scoring failed, falling back to heuristic:", error);
    let score = 65;
    const lowerDesc = jobDescription.toLowerCase();
    if (lowerDesc.includes("python") || lowerDesc.includes("quality") || lowerDesc.includes("qa") || lowerDesc.includes("ai")) {
      score = 85;
    }
    return {
      matchScore: score,
      matchExplanation: "Evaluated based on keyword overlap with pharmaceutical QA and AI/Python technical profile."
    };
  }
}
