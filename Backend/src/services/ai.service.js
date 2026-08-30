import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config({
    path: new URL("../../.env", import.meta.url)
});

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});
console.log("Gemini APi Key",process.env.GEMINI_API_KEY?"Found":"Not found");

export const generateMeetingSummary = async (transcript) => {

    const prompt = `
You are an AI meeting assistant.

Summarize the following meeting transcript.

Return the response in this format:

Meeting Summary:
<short summary>

Key Points:
- point 1
- point 2
- point 3

Action Items:
- action item 1
- action item 2

Decisions:
- decision 1
- decision 2

Meeting Transcript:
${transcript}
`;

    const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
    });

    return response.text;
};