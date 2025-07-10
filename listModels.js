const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  // Check what methods are available on genAI object
  console.log('Available methods:', Object.keys(genAI));

  if (typeof genAI.listModels !== 'function') {
    console.log("listModels() method is NOT available in this SDK version.");
    return;
  }

  const models = await genAI.listModels();
  models.forEach(m => console.log(m.name));
}

listModels();
