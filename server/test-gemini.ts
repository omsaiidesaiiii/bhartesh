import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

dotenv.config();

async function testGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY1 not found');
    return;
  }

  console.log('Testing Gemini API with key ending in:', apiKey.slice(-10));

  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    console.log('Model created successfully');

    const result = await model.generateContent('Hello, just testing the API');
    console.log('API call successful');
    console.log('Response:', result.response.text().substring(0, 100) + '...');
  } catch (error) {
    console.error('Error:', error);
  }
}

testGemini();