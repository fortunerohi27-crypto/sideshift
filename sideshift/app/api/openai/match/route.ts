import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { openai } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    // 1. Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // 2. Fetch all available opportunities
    const { data: opportunities, error: oppsError } = await supabase
      .from("opportunities")
      .select("*");

    if (oppsError) {
      return NextResponse.json({ error: "Failed to fetch opportunities" }, { status: 500 });
    }

    // 3. AI Ranking Logic
    const prompt = `
      You are an expert career counselor and side-hustle optimizer.
      Analyze the following user profile and rank the most suitable side-hustles from the provided list.

      USER PROFILE:
      - Name: ${profile.full_name}
      - Skills: ${profile.skills.join(", ")}
      - Tools/Equipment: ${profile.tools.join(", ")}
      - Location: ${profile.location}
      - Available Hours/Week: ${profile.available_hours}
      - Preferred Work Type: ${profile.work_type}
      - Income Goal: $${profile.income_goal}/month

      OPPORTUNITIES LIST:
      ${JSON.stringify(opportunities)}

      TASK:
      For each opportunity, provide a match score (0-100) and a concise, personalized reason (1 sentence) why it fits or doesn't fit the user.
      Return the result strictly as a JSON array of objects:
      [
        { "opportunity_id": "uuid", "match_score": number, "reason": "string" },
        ...
      ]
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant that returns only valid JSON." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    const matches = result.matches || result.opportunities || Object.values(result).find((v: any) => Array.isArray(v)) as any[];

    if (!matches) {
      return NextResponse.json({ error: "AI failed to generate matches" }, { status: 500 });
    }

    // 4. Save matches to database
    const matchData = matches.map((m: any) => ({
      user_id: userId,
      opportunity_id: m.opportunity_id,
      match_score: m.match_score,
      reason: m.reason,
    }));

    const { error: saveError } = await supabase
      .from("user_matches")
      .upsert(matchData, { onConflict: "user_id, opportunity_id" }); // Note: requires unique constraint on these columns

    if (saveError) {
      console.error("Save Error:", saveError);
      // We'll continue and return the matches anyway for the UI
    }

    return NextResponse.json({ success: true, matches });
  } catch (error: async (err) => {
    console.error("AI Matching Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  })
}
