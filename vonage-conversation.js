require('dotenv').config();
const { Vonage } = require('@vonage/server-sdk');
const express = require('express');
const app = express();

// Enable JSON parsing for incoming webhooks
app.use(express.json());

// Initialize Vonage with credentials
const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET,
  applicationId: process.env.VONAGE_APPLICATION_ID
});

// Default sender number
const DEFAULT_FROM = process.env.VONAGE_PHONE_NUMBER || "447418343907";

// Enhanced logging function
function logMessage(type, data) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${type}]`, JSON.stringify(data, null, 2));
}

// Function to send SMS with enhanced logging
async function sendSMS(to, text, from = DEFAULT_FROM) {
  try {
    logMessage('SEND_ATTEMPT', { to, from, text });

    // Remove '+' prefix from phone number if present
    to = to.replace('+', '');
    from = from.replace('+', '');

    const response = await vonage.sms.send({
      to,
      from,
      text
    });

    // Log the response
    const messageDetails = response.messages[0];
    logMessage('SEND_RESPONSE', {
      success: messageDetails.status === '0',
      messageId: messageDetails['message-id'],
      status: messageDetails.status,
      to: messageDetails.to,
      remainingBalance: messageDetails['remaining-balance'],
      price: messageDetails['message-price'],
      network: messageDetails.network
    });

    return response;
  } catch (error) {
    logMessage('SEND_ERROR', {
      error: error.message,
      stack: error.stack,
      code: error.code
    });
    throw error;
  }
}

// Function to send agent updates
async function sendAgentUpdate(to, message) {
  try {
    await sendSMS(to, `🤖 ${message}`);
    logMessage('AGENT_UPDATE', { to, message });
  } catch (error) {
    logMessage('UPDATE_ERROR', { error: error.message, to, message });
  }
}

// Process incoming messages
async function processIncomingMessage(text, from) {
  try {
    // Simple response for now
    const response = `I received your message: "${text}". I'm a simple agent for now, but I'll be smarter soon!`;
    await sendSMS(from, response);
    
    logMessage('MESSAGE_PROCESSED', { 
      from,
      text,
      response
    });
  } catch (error) {
    logMessage('PROCESSING_ERROR', { error: error.message, from, text });
    await sendSMS(from, 'Sorry, I encountered an error processing your request. Please try again.');
  }
}

// Webhook endpoint for inbound messages
app.post('/inbound', (req, res) => {
  logMessage('INBOUND_MESSAGE', req.body);
  
  const { msisdn: from, text } = req.body;
  
  if (text) {
    processIncomingMessage(text, from).catch(error => {
      logMessage('PROCESSING_ERROR', { error: error.message, from, text });
    });
  }
  
  res.status(200).end();
});

// Test endpoint to send a message
app.post('/test-message', async (req, res) => {
  try {
    const { to, text } = req.body;
    
    if (!to || !text) {
      return res.status(400).json({ 
        error: 'Missing required parameters', 
        required: { to: 'Phone number', text: 'Message content' } 
      });
    }

    await sendAgentUpdate(to, text);
    res.json({
      success: true,
      message: 'Agent update sent successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Webhook endpoint for delivery receipts
app.post('/status', (req, res) => {
  logMessage('DELIVERY_RECEIPT', req.body);
  res.status(200).end();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    vonageInitialized: !!vonage,
    defaultSender: DEFAULT_FROM
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  logMessage('SERVER_ERROR', {
    error: error.message,
    stack: error.stack,
    path: req.path
  });
  res.status(500).json({ error: 'Internal server error' });
});

// Start the server if not running in Vercel
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Webhook URLs:');
    console.log(`- Status webhook: https://personal-agent-lime.vercel.app/status`);
    console.log(`- Inbound webhook: https://personal-agent-lime.vercel.app/inbound`);
    console.log(`- Test endpoint: https://personal-agent-lime.vercel.app/test-message`);
  });
}

// Export for Vercel
module.exports = app; 