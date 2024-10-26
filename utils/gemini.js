import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.API_KEY


// Initialize GoogleGenerativeAI with your API_KEY.
const googleAI = new GoogleGenerativeAI(apiKey);

// Initialize GoogleAIFileManager with your API_KEY.
const fileManager = new GoogleAIFileManager(apiKey);

const geminiConfig = {
    temperature: 0.9,
    topP: 1,
    topK: 1,
    maxOutputTokens: 4096,
};

const geminiPromptModel = googleAI.getGenerativeModel({
    model: "gemini-pro",
    geminiConfig,
});

const geminiPdfModel = googleAI.getGenerativeModel({
    model: "gemini-1.5-flash",
});


export const generateFromPrompt = async (prompt) => {
    try {
        const result = await geminiPromptModel.generateContent(prompt);
        const response = result.response.text()
        return response
    } catch (error) {
        console.log("response error", error);
    }
};


export const generatePdfSummary = async (fileName, prompt) => {
    try {
        const uploadResponse = await fileManager.uploadFile(`uploads/${fileName}`, {
            mimeType: "application/pdf",
            displayName: "Gemini 1.5 PDF",
        });

        const result = await geminiPdfModel.generateContent([
            {
                fileData: {
                    mimeType: uploadResponse.file.mimeType,
                    fileUri: uploadResponse.file.uri,
                },
            },
            { text: prompt || "Can you summarize this document as a bulleted list." },
        ]);

        const response = result.response.text();
        return response
    } catch (error) {
        console.log("response error", error);
    }
}