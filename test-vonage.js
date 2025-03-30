require('dotenv').config();
const { Vonage } = require('@vonage/server-sdk');

// Initialize Vonage with credentials from .env.local
const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET
});

// Message details
const from = "Personal Agent";
const to = process.env.TWILIO_USER_PHONE_NUMBER.replace('+', ''); // Remove the '+' prefix
const text = 'Hello from your Personal AI Agent via Vonage SMS API!';

async function sendSMS() {
  try {
    console.log('Sending SMS...');
    console.log('From:', from);
    console.log('To:', to);
    console.log('Message:', text);

    await vonage.sms.send({
      to,
      from,
      text
    })
    .then(resp => {
      console.log('Message sent successfully');
      console.log(resp);
    })
    .catch(err => {
      console.log('There was an error sending the messages.');
      console.error(err);
    });
  } catch (error) {
    console.error('Error in sendSMS:', error);
  }
}

// Run the test
console.log('Starting Vonage SMS test...');
sendSMS(); 