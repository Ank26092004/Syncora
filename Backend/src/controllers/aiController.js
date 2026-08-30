import { generateMeetingSummary } from "../services/ai.service.js";

export const getMeetingSummary = async (req, res) => {
    try {
        const { transcript } = req.body;

        if (!transcript) {
            return res.status(400).json({
                success: false,
                message: "Transcript is required"
            });
        }

        const summary = await generateMeetingSummary(transcript);

        return res.status(200).json({
            success: true,
            summary
        });

    } catch (error) {
        console.error("AI SUMMARY ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to generate meeting summary"
        });
    }
};