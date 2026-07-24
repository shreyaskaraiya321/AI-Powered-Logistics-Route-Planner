const { GoogleGenAI } = require('@google/genai');
const AiGeneration = require('../models/AiGeneration');

// Explicitly pass GEMINI_API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function callGeminiAndSave(type, relatedRouteId, relatedOrderId, promptText) {
  try {
    console.log('Using STUBBED Gemini API for type:', type);
    
    // TODO: REVERT THIS STUB ONCE API KEY ISSUE IS RESOLVED
    // Temporary fallback - not the real implementation.
    
    const distanceMatch = promptText.match(/Distance:\s*([\d.]+)/i);
    const durationMatch = promptText.match(/Duration:\s*([\d.]+)/i);
    const stopsMatch = promptText.match(/Stops:\s*(\d+)/i) || promptText.match(/sequence:\s*(.+)/i);
    const loadMatch = promptText.match(/load/i) ? "heavy load" : "standard load";
    
    const dist = distanceMatch ? distanceMatch[1] : (Math.floor(Math.random() * 50) + 10);
    const dur = durationMatch ? durationMatch[1] : (Math.floor(Math.random() * 120) + 30);
    
    let stops = 1;
    if (stopsMatch) {
      if (!isNaN(parseInt(stopsMatch[1]))) {
        stops = parseInt(stopsMatch[1]);
      } else {
        stops = stopsMatch[1].split(',').length;
      }
    } else {
      stops = Math.floor(Math.random() * 10) + 1;
    }
    
    const randId = Math.random().toString(36).substring(2, 6).toUpperCase();
    
    let responseText = "";
    if (type === 'route-explanation') {
      responseText = `[STUB - ID:${randId}] The generated route is fully optimized. It covers a total distance of ${dist} units and will take approximately ${dur} minutes for ${stops} stops. The ${loadMatch} capacity and time window constraints have been successfully met.`;
    } else if (type === 'dispatcher-summary') {
      responseText = `[STUB - ID:${randId}]\n- Status: Optimized\n- Stops: ${stops}\n- Est. Time: ${dur} mins\n- Distance: ${dist} units`;
    } else if (type === 'driver-summary') {
      responseText = `[STUB - ID:${randId}] Hey driver! Your shift today includes ${stops} stops over ${dist} units. Expect it to take around ${dur} mins. Drive safely!`;
    } else if (type === 'exception-message') {
      responseText = `[STUB - ID:${randId}] An exception was logged for this destination. Please hold the package and contact dispatch immediately.`;
    } else if (type === 'customer-update') {
      responseText = `[STUB - ID:${randId}] Hello! There is an update regarding your delivery status. Please check your tracking link for more details.`;
    } else {
      responseText = `[STUB - ID:${randId}] Fallback response for ${type}. Details: ${dist} units, ${dur} mins.`;
    }
    
    const record = await AiGeneration.create({
      type,
      relatedRouteId,
      relatedOrderId,
      promptUsed: promptText,
      responseText
    });
    
    return record;
  } catch (error) {
    const rawMsg = error?.message || String(error);
    console.error('=== GEMINI RAW ERROR ===');
    console.error('Status:', error?.status);
    console.error('Message:', rawMsg);
    console.error('========================');
    throw new Error(`Gemini Error [${error?.status}]: ${rawMsg}`);
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
