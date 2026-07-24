const { GoogleGenAI } = require('@google/genai');
const AiGeneration = require('../models/AiGeneration');

// Explicitly pass GEMINI_API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function callGeminiAndSave(type, relatedRouteId, relatedOrderId, promptText) {
  try {
    // TODO: REVERT THIS STUB ONCE API KEY ISSUE IS RESOLVED
    // Stubbed response to avoid 429 Rate Limit errors during E2E testing
    const responseText = "[STUB] This is a hardcoded AI explanation because the Gemini API is currently rate limited. The route is optimal and correctly addresses all vehicle capacity and time window constraints.";
    
    const record = await AiGeneration.create({
      type,
      relatedRouteId,
      relatedOrderId,
      promptUsed: promptText,
      responseText
    });
    
    return record;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to generate AI content');
  }
}

async function generateRouteExplanation(route, orders, constraints) {
  const promptText = `
    You are an expert logistics AI. Please explain the following route plan clearly to a dispatcher.
    Route ID: ${route._id}
    Total Distance: ${route.estimatedDistance}
    Total Duration: ${route.estimatedDuration}
    Orders in sequence: ${orders.map(o => o.destination).join(', ')}
    Constraints applied: ${JSON.stringify(constraints)}
    
    Provide a concise paragraph explaining why this route is optimal and how it satisfies the constraints.
  `;
  return await callGeminiAndSave('route-explanation', route._id, null, promptText);
}

async function generateDispatcherSummary(route) {
  const promptText = `
    You are an AI assistant for a logistics company. Summarize the following route for a dispatcher in 3 bullet points:
    Route Status: ${route.status}
    Driver ID: ${route.driverId || 'Unassigned'}
    Vehicle ID: ${route.vehicleId}
    Number of Stops: ${route.stopOrder.length}
    Estimated Duration: ${route.estimatedDuration} mins
  `;
  return await callGeminiAndSave('dispatcher-summary', route._id, null, promptText);
}

async function generateDriverInstructions(route) {
  const promptText = `
    You are generating a daily brief for a delivery driver.
    Route ID: ${route._id}
    Number of Stops: ${route.stopOrder.length}
    Estimated Distance: ${route.estimatedDistance}
    Estimated Duration: ${route.estimatedDuration} mins
    
    Write a short, encouraging message and provide top-level instructions for the driver to ensure they stay on schedule. 
    Keep it under 3 sentences.
  `;
  return await callGeminiAndSave('driver-summary', route._id, null, promptText);
}

async function generateExceptionSummary(statusEvent, order) {
  const promptText = `
    An exception occurred during delivery.
    Order ID: ${order._id}
    Destination: ${order.destination}
    Event Type: ${statusEvent.type}
    Reason Provided: ${statusEvent.reason || 'None'}
    
    Write a short incident summary for the dispatcher explaining what went wrong and proposing an immediate next step.
  `;
  return await callGeminiAndSave('exception-message', null, order._id, promptText);
}

async function generateCustomerUpdate(order, statusEvent) {
  const promptText = `
    You are a customer service AI. Write a polite SMS update (max 160 characters) to a customer regarding their order.
    Order Destination: ${order.destination}
    New Status: ${statusEvent.type}
    Reason (if delayed/failed): ${statusEvent.reason || ''}
  `;
  return await callGeminiAndSave('customer-update', null, order._id, promptText);
}

async function generateMissingInfoQuestions(order) {
  const promptText = `
    The following order might be missing details necessary for delivery:
    Destination: ${order.destination}
    Instructions: ${order.customerInstructions || 'None'}
    
    Write a short, polite question to the customer asking them to clarify any gate codes, exact building numbers, or missing constraints.
  `;
  return await callGeminiAndSave('constraint-question', null, order._id, promptText);
}

module.exports = {
  generateRouteExplanation,
  generateDispatcherSummary,
  generateDriverInstructions,
  generateExceptionSummary,
  generateCustomerUpdate,
  generateMissingInfoQuestions
};
