import "dotenv/config";
import { OpenAI } from "openai";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const chat = async () => {
  const client = new OpenAI();

  const rl = readline.createInterface({ input, output });
  console.log(
    "Welcome to the Node.js Chatbot! Ask your questions about Node.js."
  );

  const messages = [];
  while (true) {
    const userQuery = await rl.question("You 👤: ");

    if (userQuery.toLowerCase() === "exit") {
      console.log("Exiting the chatbot. Goodbye!");
      break;
    }

    if (!userQuery.trim()) {
      console.log("Please enter a valid question.");
      continue;
    }

    const opnAI_Embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-large",
    });

    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      opnAI_Embeddings,
      {
        url: process.env.QDRANT_URL,
        collectionName: "Node_document-collection",
      }
    );

    const vectorSearcher = vectorStore.asRetriever({
      k: 3,
    });

    const chunks = await vectorSearcher.invoke(userQuery);

    const SYSTEM_PROMPT = `
    You are a helpful AI assistant. Use the following pieces of context to answer the question at the end along with the page number. 
    If you don't know the answer, just say that you don't know, don't try to make up an answer.
    Context:
    ${JSON.stringify(chunks)}}
`;

    messages.push({
      role: "system",
      content: SYSTEM_PROMPT,
    });

    messages.push({
      role: "user",
      content: userQuery,
    });

    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages,
    });

    console.log("AI 🤖: ", response.choices[0].message.content, "\n\n");
    messages.push({
      role: "assistant",
      content: response.choices[0].message.content,
    });
    // console.log("Chat History:", messages);
  }
  rl.close();
};

chat();
