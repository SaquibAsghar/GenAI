import "dotenv/config";

import OpenAI from "openai";

const openAIClient = new OpenAI();

const geminiClient = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

const SYSTEM_PROMPT = `
You are an AI Assitant name BhaiAI, you should always keep thinking and thinking before given the answer. 
Before you send the response, make sure you have thought about the question and then answer it.
Also before outputing the final result to user make sure you must check once if everything id correct .
Rules:
- Strictly follows the output JSON format.
- Think carefully before answering.
- Always respond in valid JSON only (no extra text, no trailing commas).
- Always perform one step at a time and wait for the next instruction.
- Do not output multiple JSON objects separately. 
- You should always think before answering.
- Always make sure to do multiple steps of thinking before giving outputs.
- The first step will always be START, followed by multples steps of THINK, and finally an OUTPUT step.
- You must always output exactly one valid JSON object at a time.
- Do not wrap in arrays. No extra text. Only JSON.

Output JSON format:
{ "step": "START | THINK | EVALUATE | OUTPUT", "content": "string"}

Example:
USER: can you solve this equation 3 + 5 + 2 * 10 - 4 / 2
ASSISTANT: { "step": "START", "content": "I will start by solving the equation step by step."}
ASSISTANT: { "step": "THINK", "content": "This is typical Mathematical equation, I will solve it step by step."}
ASSISTANT: { "step": "EVALUATE", "content": "Evaluating, it seems you are going good."}  
ASSISTANT: { "step": "THINK", "content": "First, I will solve the multiplication and division, then I will add and subtract."}
ASSISTANT: { "step": "EVALUATE", "content": "Evaluating, it seems you are going good."} 
ASSISTANT: { "step": "THINK", "content": "According to the BODMAS rule, I will solve the equation in the following order: 4 / 2 = 2"}
ASSISTANT: { "step": "EVALUATE", "content": "Evaluating, it seems you are going good."} 
ASSISTANT: { "step": "THINK", "content": "Now, I will multiply 2 * 10 from the given equation which results in 20"}
ASSISTANT: { "step": "EVALUATE", "content": "Evaluating, it seems you are going good."} 
ASSISTANT: { "step": "THINK", "content": "Now, I will add 3 + 5 + 20 which gives 28"}
ASSISTANT: { "step": "EVALUATE", "content": "Evaluating, it seems you are going good."} 
ASSISTANT: { "step": "THINK", "content": "Now, I will subtract 28 - 2 which gives 26"}
ASSISTANT: { "step": "EVALUATE", "content": "Evaluating, it seems you are going good."} 
ASSISTANT: { "step": "THINK", "content": "The final result of the equation 3 + 5 + 2 * 10 - 4 / 2 is 26"}
ASSISTANT: { "step": "EVALUATE", "content": "Evaluating, it seems you are going good."} 
ASSISTANT: { "step": "THINK", "content": "Great, now I think I have solved the given equation 3 + 5 + 2 * 10 - 4 / 2, which results in 26."}
ASSISTANT: { "step": "EVALUATE", "content": "Evaluating, it seems you are going good."} 
ASSISTANT: { "step": "OUTPUT", "content": "The final result of the equation 3 + 5 + 2 * 10 - 4 / 2 is 26"}
`;

const messages = [
  {
    role: "system",
    content: SYSTEM_PROMPT,
  },
  {
    role: "user",
    content: "write a code in JS to find a prime number as fast as possible.",
    // content: "can you solve this equation 40 + 5 + 2 * 10 - 4 / 2",
  },
];

async function mainFunc() {
  try {
    while (true) {
      const clientResponse = await openAIClient.chat.completions.create({
        model: "gpt-4.1-mini",
        messages,
      });
      console.log("\n----\n");
      let rawResponse = clientResponse.choices[0].message.content;
      console.log("Raw Response: ", rawResponse);
      const parsedResponse = JSON.parse(rawResponse);
      messages.push({
        role: "assistant",
        content: JSON.stringify(parsedResponse),
      });
      if (parsedResponse.step === "START") {
        console.log("▶️ :", parsedResponse.content);
        continue;
      }

      if (parsedResponse.step === "THINK") {
        console.log("\t🧠 :", parsedResponse.content);


        // Evaluate the thought process

        const geminiClientResponse = await geminiClient.chat.completions.create(
          {
            model: "gemini-2.0-flash",
            messages: [
              {
                role: "system",
                content:
                  "You are a strict evaluator. Return JSON in the same format.",
              },
              {
                role: "user",
                content: `Evaluate this reasoning step:\n ${rawResponse}`,
              },
            ],
          }
        );

        let geminiRawResponse =
          geminiClientResponse.choices?.[0]?.message?.content || "";

        // Strip markdown fences if Gemini wraps JSON in ```json ... ```
        geminiRawResponse = geminiRawResponse
          .replace(/```json|```/g, "")
          .trim();

        let geminiParsedResponse;
        try {
          geminiParsedResponse = JSON.parse(geminiRawResponse);
          console.log("Gemini Response ✅:", geminiParsedResponse);
        } catch (err) {
          console.error("Gemini JSON parse error:", err, geminiRawResponse);
          throw err;
        }

        continue;
      }

      if (parsedResponse.step === "OUTPUT") {
        console.log("🤖 :", parsedResponse.content);
        console.log("\n------END----\n");
        console.log(messages);
        break;
      }
    }
  } catch (error) {
    console.error("Error caught:", error.message);
  }
  console.log("Done with the response...");
}

mainFunc();
