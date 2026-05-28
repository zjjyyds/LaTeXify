import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const PORT = 3000;

const SYSTEM_INSTRUCTION = `You are an expert transcriber of academic material. The user will provide an image containing a math problem, physics problem, or computer science problem (e.g., Chinese 408 exam). It might include multiple choice questions or long-form proofs and calculations. Your task is to extract all the text and mathematical formulas perfectly.
Rules:
1. Use standard LaTeX for all mathematical expressions.
2. Use $...$ for inline math and $$...$$ for block math.
3. Keep the overall layout organized in Markdown format (use headings, lists if there are options A B C D).
4. Output ONLY the transcribed Markdown content without any conversational filler or introductions.`;

async function startServer() {
  const app = express();
  
  // Increase payload limit because images can be large
  app.use(express.json({ limit: "50mb" }));

  app.post("/api/recognize", async (req, res) => {
    try {
      const { imageBase64, mimeType, customApiKey, customModel, provider, customBaseUrl } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: "Missing image" });
      }

      if (provider && provider !== "gemini") {
        if (!customApiKey) {
          return res.status(400).json({ error: `API key is required for ${provider} provider.` });
        }

        let baseUrl = customBaseUrl || "https://api.openai.com/v1";
        if (provider === "deepseek" && !customBaseUrl) {
          baseUrl = "https://api.deepseek.com/v1";
        } else if (provider === "xiaomi" && !customBaseUrl) {
          baseUrl = "https://api.xiaomimimo.com/v1";
        }

        const apiUrl = baseUrl.replace(/\/$/, '') + "/chat/completions";
        const targetModel = customModel || "deepseek-chat";

        // Filter out non-multimodal models if possible, or return clear error
        if (targetModel.includes("deepseek") || targetModel === "mimo-v2.5-pro" || targetModel === "mimo-v2-pro" || targetModel === "mimo-v2-flash") {
          return res.status(400).json({ 
            error: `Model '${targetModel}' does not support image input. Please select a vision-capable model (like mimo-v2.5, mimo-v2-omni, or use Gemini).` 
          });
        }

        const apiRes = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${customApiKey}`
          },
          body: JSON.stringify({
            model: targetModel,
            messages: [
              {
                role: "system",
                content: SYSTEM_INSTRUCTION
              },
              {
                role: "user",
                content: [
                  { type: "text", text: "Extract all text and math from this image." },
                  { type: "image_url", image_url: { url: `data:${mimeType};base64,${imageBase64}` } }
                ]
              }
            ],
            temperature: 0.2
          })
        });

        const data = await apiRes.json();
        if (!apiRes.ok) {
          throw new Error(data.error?.message || `Failed to call ${provider} API`);
        }

        return res.json({
          result: data.choices?.[0]?.message?.content || "",
          usage: {
            promptTokenCount: data.usage?.prompt_tokens || 0,
            candidatesTokenCount: data.usage?.completion_tokens || 0,
            totalTokenCount: data.usage?.total_tokens || 0
          }
        });
      }

      // Gemini Branch
      const effectiveApiKey = customApiKey || process.env.GEMINI_API_KEY;
      if (!effectiveApiKey) {
        return res.status(500).json({ error: "Gemini API key is not configured. Please set a custom key in Settings." });
      }

      const ai = new GoogleGenAI({ 
        apiKey: effectiveApiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        } 
      });

      const targetModel = customModel || "gemini-3.1-pro-preview";

      const response = await ai.models.generateContent({
        model: targetModel,
        contents: [
          {
            inlineData: {
              data: imageBase64,
              mimeType: mimeType || "image/jpeg",
            },
          },
          {
            text: "Extract all text and math from this image.",
          },
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.2, // Low temperature for high accuracy extraction
        },
      });

      res.json({ 
        result: response.text,
        usage: {
          promptTokenCount: response.usageMetadata?.promptTokenCount || 0,
          candidatesTokenCount: response.usageMetadata?.candidatesTokenCount || 0,
          totalTokenCount: response.usageMetadata?.totalTokenCount || 0
        }
      });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message || "Failed to process image" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
