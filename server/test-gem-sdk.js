require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: 'Say hello!',
  });
  console.log(response);
  console.log("response.text:", response.text);
}
run();
