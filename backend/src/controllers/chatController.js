const { OpenAI } = require("openai");

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY?.replace(/^=/, ''),
});

/**
 * @desc    Handles user queries via AI Chatbot
 * @route   POST /api/chat
 * @access  Public
 */
const handleChatQuery = async (req, res, next) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        success: false,
        message: "Messages array is required",
      });
    }

    // System prompt giving context to the AI about its role
    const systemMessage = {
      role: "system",
      content: `You are a helpful AI assistant for the 'Smart Complaint Intelligence System'.
Your job is to assist users with using the platform, submitting complaints, tracking their status, and general queries about the complaint process.
Keep your answers concise, helpful, and polite. If a user asks a question unrelated to complaints or the system, politely guide them back to the platform's purpose.

Key features of the system:
1. Submit Complaints: Users can submit text and attach an image. The system automatically classifies the complaint department and predicts its urgency.
2. Track Complaints: Users can track the status using their complaint ID.
3. My Complaints: Users can view all complaints they have submitted.
4. Duplicate Detection: The system intelligently detects if a similar complaint already exists to avoid spam.

Please respond professionally and use Markdown for formatting when appropriate.`,
    };

    // Construct message history including the system message
    const apiMessages = [systemMessage, ...messages];

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // You can use gpt-4o-mini if available on the key
      messages: apiMessages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const aiMessage = response.choices[0].message;

    res.status(200).json({
      success: true,
      message: aiMessage,
    });
  } catch (error) {
    console.error("Chatbot Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to communicate with the AI Chatbot. Please try again later.",
    });
  }
};

module.exports = {
  handleChatQuery,
};
