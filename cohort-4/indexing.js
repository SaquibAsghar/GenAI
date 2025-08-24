import "dotenv/config";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";

const opnAI_Embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-large",
});

const filePath = "./nodejs.pdf";

const loader = new PDFLoader(filePath); // intialize the PDF loader

const docs = await loader.load(); // load the document

// console.log("Document Loaded\n", docs);

// const textSplitter = new RecursiveCharacterTextSplitter({
//   chunkSize: 500,
//   chunkOverlap: 150,
// });

// const splitTexts = [];
// for (const doc of docs) {
//   const texts = await textSplitter.splitText(doc.pageContent);
//   splitTexts.push(...texts);
// }

// console.log("Text Splitter\n", splitTexts);

const vectorStore = await QdrantVectorStore.fromDocuments(
  docs,
  opnAI_Embeddings,
  {
    url: process.env.QDRANT_URL,
    collectionName: "Node_document-collection",
  }
);

// console.log("Vector Store\n", vectorStore);
