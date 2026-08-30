
import dotenv from "dotenv";
import { generateMeetingSummary } from "./services/ai.service.js";

dotenv.config();

const transcript = `
Today we discussed the Syncora project.

Ankush will integrate the AI meeting summary feature.
Rahul will work on improving the frontend UI.
The team decided to use Gemini for generating meeting summaries.
We will first test the feature using manually provided transcripts.
`;

try {
    const summary = await generateMeetingSummary(transcript);

    console.log("\n===== AI MEETING SUMMARY =====\n");
    console.log(summary);
    console.log("\n==============================\n");
} catch (error) {
    console.error("AI ERROR:", error);
}