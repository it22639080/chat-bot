import aiInference, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

const endpoint = "https://models.github.ai/inference";
const model = "mistral-ai/mistral-small-2503";

const SYSTEM_PROMPT = `You are an e-commerce assistant. You can only help with:
- Shopping-related questions
- Product inquiries
-hi
- Order issues
- Payment problems
- Shipping and delivery
- Returns and refunds
- Online shopping guidance
Politely decline any personal, non-shopping related questions.`;

const isEcommerceRelated = (message) => {
  const ecommerceKeywords = [
    'shop', 'buy', 'order', 'product', 'price', 'payment',
    'shipping', 'delivery', 'return', 'refund', 'cart',
    'checkout', 'store', 'purchase', 'discount', 'sale','hi'
  ];
  
  return ecommerceKeywords.some(keyword => 
    message.toLowerCase().includes(keyword.toLowerCase())
  );
};

export const createChatCompletion = async (messages) => {
  try {
    const userMessage = messages[messages.length - 1].content;
    
    if (!isEcommerceRelated(userMessage)) {
      return "I apologize, but I can only assist with e-commerce and shopping-related questions. Please ask something related to online shopping, products, orders, payments, shipping, or returns.";
    }

    const client = aiInference(
      endpoint,
      new AzureKeyCredential(process.env.REACT_APP_GITHUB_TOKEN)
    );

    const response = await client.path("/chat/completions").post({
      body: {
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages
        ],
        temperature: 0.7, // Reduced temperature for more focused responses
        top_p: 0.9,
        max_tokens: 1000,
        model: model
      }
    });

    if (isUnexpected(response)) {
      throw new Error(response.body.error || 'Unexpected response');
    }

    return response.body.choices[0].message.content;
  } catch (error) {
    throw new Error(error.message || 'Failed to get response from AI');
  }
};
