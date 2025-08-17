import "dotenv/config";
import OpenAI from "openai";

const client = new OpenAI();

const init = async () => {
  const result = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: "I'm Saquib, how are you?",
    encoding_format: "float",
  });
  console.log(result);
console.log('\n----\n')
  console.log(result.data[0].embedding);
  console.log('Length : ', result.data[0].embedding.length);
  console.log(result.data[0].object);
};

console.log(init());
