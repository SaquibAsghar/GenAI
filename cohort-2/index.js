import "dotenv/config";

import OpenAI from "openai";
import { chatMessageHistory } from "./chatHistory/chatHistory.js";

const openAIClient = new OpenAI();

const geminiClient = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

const claudeClient = new OpenAI({
  baseURL: "https://api.anthropic.com/v1/",
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const deepseekClient = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

const mainFunc = async () => {
  chatMessageHistory.push({
    role: "user",
    content:
      "I was wondering if you could help me with some JavaScript concepts.",
  });
  console.log("chat history: ", chatMessageHistory);

  try {
    const clientResponse = await claudeClient.chat.completions.create({
      //   model: "gpt-4.1-mini",
      // model: "gemini-2.0-flash",
      model: "claude-opus-4-1-20250805",
      
      //   model: "deepseek-chat",
      messages: chatMessageHistory,
    });

    // console.log("client => ", clientResponse);

    // console.log("Token => ", clientResponse.usage);

    console.log(
      "Client Response 🤖 :",
      clientResponse.choices[0].message.role,
      " => ",
      clientResponse.choices[0].message.content
    );

    longMessage.push({
      role: clientResponse.choices[0].message.role,
      content: clientResponse.choices[0].message.content,
    });
  } catch (error) {
    if (error.status >= 400) {
      const errMessage = error?.error?.message
        ? error.error.message
        : "Model not responding due to some technical issue. Please try after some time";

      console.error("Error Caught:", errMessage);
      return;
    }
    // console.error("Error caught:", error.message);
    // console.error("Error status:", error.status);
  }
};

mainFunc();
