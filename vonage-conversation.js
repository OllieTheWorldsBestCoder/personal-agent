require('dotenv').config();
const { Vonage } = require('@vonage/server-sdk');
const express = require('express');
const { processMessage, initializeState, processDailyNews, processEmailUpdates } = require('./src/lib/orchestrator');
const app = express();

// Enable JSON parsing for incoming webhooks
app.use(express.json());

// Initialize Vonage with credentials
const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET,
  applicationId: process.env.VONAGE_APPLICATION_ID,
  privateKey: process.env.VONAGE_PRIVATE_KEY
});

// Default sender number
const DEFAULT_FROM = process.env.VONAGE_PHONE_NUMBER || "447418343907";

// Initialize agent state
let agentState = initializeState();

// Message status codes and their meanings
const MESSAGE_STATUSES = {
  '0': 'Success',
  '1': 'Throttled',
  '2': 'Missing Parameters',
  '3': 'Invalid Parameters',
  '4': 'Invalid Credentials',
  '5': 'Internal Error',
  '6': 'Invalid Message',
  '7': 'Number Barred',
  '8': 'Partner Account Barred',
  '9': 'Partner Quota Exceeded',
  '10': 'Too Many Existing Binds',
  '11': 'Account Not Enabled For REST',
  '12': 'Message Too Long',
  '13': 'Communication Failed',
  '14': 'Invalid Signature',
  '15': 'Invalid Sender Address',
  '16': 'Invalid TTL',
  '19': 'Facility Not Allowed',
  '20': 'Invalid Message Class'
};

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

    // Log the response with detailed status information
    const messageDetails = response.messages[0];
    const status = MESSAGE_STATUSES[messageDetails.status] || 'Unknown Status';
    
    logMessage('SEND_RESPONSE', {
      success: messageDetails.status === '0',
      messageId: messageDetails['message-id'],
      status: {
        code: messageDetails.status,
        description: status
      },
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

// Process incoming messages through the agent
async function processIncomingMessage(text, from) {
  try {
    // Process message through orchestrator
    const { response, state } = await processMessage(text, agentState);
    
    // Update agent state
    agentState = state;
    
    // Send response
    await sendSMS(from, response);
    
    // Log state update
    logMessage('STATE_UPDATE', { 
      lastTopic: state.context.lastTopic,
      lastAction: state.context.lastAction
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
    defaultSender: DEFAULT_FROM,
    agentState: {
      lastTopic: agentState.context.lastTopic,
      preferences: agentState.preferences
    }
  });
});

// Daily news endpoint
app.post('/daily-news', async (req, res) => {
  try {
    const result = await processDailyNews(agentState);
    if (result.success) {
      res.json({ success: true, message: 'Daily news processed successfully' });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Email updates endpoint
app.post('/email-updates', async (req, res) => {
  try {
    const result = await processEmailUpdates(agentState);
    if (result.success) {
      res.json({ success: true, message: 'Email updates processed successfully' });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
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

// Test message if running directly
if (require.main === module) {
  const testNumber = process.env.TWILIO_USER_PHONE_NUMBER;
  sendSMS(testNumber, 'Test message from Vonage Conversation API with enhanced logging!')
    .then(() => console.log('Test message sent'))
    .catch(error => console.error('Test failed:', error));
} 