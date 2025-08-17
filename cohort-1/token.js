import { Tiktoken } from "js-tiktoken";
import o200k_base from "js-tiktoken/ranks/o200k_base";

const enc = new Tiktoken(o200k_base);

const userQuery = "Hey there, I'm Saquib, how are you?";

console.log("User Query : ", userQuery);

const encodedTokens = enc.encode(userQuery);
console.log("Encoded Tokens : ", encodedTokens);

const decodedTokens = enc.decode(encodedTokens);

console.log("Decoded Tokens : ", decodedTokens);
