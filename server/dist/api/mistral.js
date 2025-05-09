import express from "express";
import { Mistral } from "@mistralai/mistralai";
import authMiddleware from "../middleware/auth.js";
const router = express.Router();
const apiKey = process.env.MISTRAL_API_KEY || "";
if (!apiKey) {
    console.error("MISTRAL_API_KEY is not set in the environment variables.");
}
const client = new Mistral({ apiKey: apiKey });
router.post("/", authMiddleware, async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
        res.status(400).json({ error: "Prompt is required" });
        return;
    }
    try {
        const chatResponse = await client.chat.complete({
            model: "mistral-large-latest",
            messages: [{ role: "user", content: prompt }],
        });
        let response = chatResponse.choices?.[0]?.message?.content ?? "No content available";
        res.json({ content: response });
        return;
    }
    catch (error) {
        console.error("Mistral API Error:", error);
        const statusCode = error.response?.status || 500;
        const errorMessage = error.response?.data?.error?.message || "Error calling Mistral API";
        res.status(statusCode).json({
            error: errorMessage,
            statusCode: statusCode,
        });
        return;
    }
});
export default router;
