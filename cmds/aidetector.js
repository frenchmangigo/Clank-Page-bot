const axios = require('axios');
const { sendMessage } = require('../handles/message');
const fs = require('fs');
 
const token = fs.readFileSync('configure.json', 'utf8');
 
module.exports = {
  name: 'aidetector',
  description: 'detect if a text was written by an ai or a human',
  usage: 'aidetector [your text]',
  author: 'Rized',
 
  async execute(senderId, args) {
    const pageAccessToken = token;
 
    const input = (args.join(' ') || 'test').trim();
    await handleAIDetection(senderId, input, pageAccessToken);
  },
};
 
const handleAIDetection = async (senderId, input, pageAccessToken) => {
  const apiUrl = `https://kaiz-apis.gleeze.com/api/aidetector-v2?q=${encodeURIComponent(input)}`;
 
  try {
    const { data: { ai, human, message } } = await axios.get(apiUrl);
 
    const fullResponse = ` 🤖 AI Generated: ${ai}\n\n🧑‍🎓 Human Generated: ${human}\n\n📃 Message: ${message}`;
    await sendResponseInChunks(senderId, fullResponse, pageAccessToken);
  } catch (error) {
    console.error('❌ Error reaching the AI Detection API:', error);
    await sendError(senderId, '❌ An error occurred while trying to process your request.', pageAccessToken);
  }
};
 
const sendResponseInChunks = async (senderId, text, pageAccessToken) => {
  const maxMessageLength = 2000;
  if (text.length > maxMessageLength) {
    const messages = splitMessageIntoChunks(text, maxMessageLength);
    for (const message of messages) {
      await sendMessage(senderId, { text: message }, pageAccessToken);
    }
  } else {
    await sendMessage(senderId, { text }, pageAccessToken);
  }
};
 
const splitMessageIntoChunks = (text, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.substring(i, i + chunkSize));
  }
  return chunks;
};
 
const sendError = async (senderId, errorMessage, pageAccessToken) => {
  await sendMessage(senderId, { text: errorMessage }, pageAccessToken);
};
