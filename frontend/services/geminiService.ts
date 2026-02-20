import { GoogleGenAI } from "@google/genai";
import { LANGUAGES, AcademicSearchResult } from "../types";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY}); as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string,
  isSnapshot: boolean = false
): Promise<string> {
  const sourceName = LANGUAGES.find(l => l.code === sourceLang)?.name || sourceLang;
  const targetLabel = targetLang === 'en' ? 'Academic English (Publication Grade)' : 'Formal Bahasa Indonesia (Standar Jurnal SINTA)';

  const modeContext = isSnapshot 
    ? "This is a SNAPSHOT. Translate only the provided segment (approx. 250-300 words). Maintain perfect scholarly tone."
    : "This is a FULL MANUSCRIPT. Translate the entire text precisely including all technical sections.";

  const nuanceInstructions = {
    de: "Handle dense sentence structures and complex compound words. Break down long sentences into modular Indonesian phrasing for clarity.",
    fr: "Adapt legal and cultural terminology carefully. Maintain scholarly elegance while ensuring the Indonesian equivalent is clear and un-abstracted.",
    es: "Handle regional variations and subjunctive moods with care. Ensure sociocultural references are adapted for an Indonesian academic context.",
    zh: "Be precise with technical terms in medicine/engineering. If a term is coined locally in China, use transliteration followed by an explanation in brackets.",
    id: "Ensure the English output meets Scopus publication standards. Use advanced academic vocabulary and proper APA/IEEE citation formats."
  }[sourceLang] || "";

  const systemInstruction = `You are an elite academic translator specializing in scholarly journals.
Context:
- Source Language: ${sourceName}
- Target Language: ${targetLabel}

Formatting Rules:
- Use Markdown for structure: Use **bold** for key terms and emphasize *italics* for emphasis.
- Use properly formatted lists for enumerations.
- Preserve all mathematical formulas and citations.

Core Requirements:
1. ${nuanceInstructions}
2. Adhere to formal scholarly norms and peer-review standards.
3. Use specific technical terminology relevant to the manuscript's field.
4. Handle citations, mathematical formulas, and references with standard formatting.
5. If target is Indonesian, follow PUEBI conventions and maintain SINTA journal quality.
6. If target is English, use American or British English consistently and follow APA/IEEE conventions.
7. Where concepts do not have direct equivalents, use the most accurate translation and add a brief parenthetical explanation.

${modeContext}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: text,
      config: {
        systemInstruction,
        // Removed thinkingConfig to prevent potential RPC 500 errors/timeouts in proxy environments
      }
    });

    return response.text || "Translation failed.";
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Translation service interrupted. Please try a shorter segment.");
  }
}

export async function refineTranslation(
  originalText: string,
  currentTranslation: string,
  instruction: string,
  targetLang: string
): Promise<string> {
  const targetLabel = targetLang === 'en' ? 'Academic English' : 'Formal Bahasa Indonesia';
  const systemInstruction = `You are an elite academic editor. You are refining an existing translation of a scholarly manuscript.
Instruction from user: "${instruction}"
Target Language: ${targetLabel}

Rules:
- Keep the technical and scholarly integrity intact.
- Output ONLY the revised translation.
- Use Markdown for structure.`;

  const prompt = `Original text:
${originalText}

Current translation:
${currentTranslation}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction,
      }
    });
    return response.text || currentTranslation;
  } catch (error) {
    console.error("Refinement Error:", error);
    throw new Error("Could not refine translation.");
  }
}

export async function generateTopicVisual(summaryText: string): Promise<string | null> {
  const prompt = `Create a professional, high-fidelity academic illustration representing the following research topic: "${summaryText.substring(0, 300)}". Style: Clean 3D abstract render, minimalist, scholarly, muted professional colors (indigo, slate, white), lighting like a high-end research facility. No text in the image.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Generation Error:", error);
    return null;
  }
}

export async function searchAcademicJournals(query: string): Promise<AcademicSearchResult> {
  const prompt = `Find the latest and most relevant academic journals, peer-reviewed articles, and research papers for the following query: "${query}". 
  Provide a scholarly synthesis of current findings and trends related to this topic. Include mentions of key journals or institutions if relevant.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const sources: { title: string; uri: string }[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    for (const chunk of chunks) {
      if (chunk.web) {
        sources.push({
          title: chunk.web.title || "Academic Source",
          uri: chunk.web.uri
        });
      }
    }

    return {
      answer: response.text || "No results found.",
      sources: sources
    };
  } catch (error) {
    console.error("Search Grounding Error:", error);
    throw new Error("Academic search service unavailable.");
  }
}