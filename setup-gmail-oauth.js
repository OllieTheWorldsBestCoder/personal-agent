require('dotenv').config();
const express = require('express');
const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = 3001;

// Log environment variables (without sensitive data)
console.log('Environment check:');
console.log('GMAIL_CLIENT_ID:', process.env.GMAIL_CLIENT_ID ? 'Found' : 'Missing');
console.log('GMAIL_CLIENT_SECRET:', process.env.GMAIL_CLIENT_SECRET ? 'Found' : 'Missing');
console.log('GOOGLE_REDIRECT_URI:', process.env.GOOGLE_REDIRECT_URI || 'Using default');

// OAuth 2.0 client configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/oauth2callback'
);

// Generate authentication URL
const scopes = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.send'
];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
  prompt: 'consent' // Force to get refresh token
});

console.log('\nAuth URL:', authUrl);

// Routes
app.get('/', (req, res) => {
  console.log('Root path accessed');
  res.send(`
    <h1>Gmail OAuth Setup</h1>
    <p>Click the link below to authorize Gmail access:</p>
    <a href="${authUrl}">Authorize Gmail Access</a>
  `);
});

app.get('/oauth2callback', async (req, res) => {
  console.log('OAuth callback received');
  console.log('Query parameters:', req.query);
  
  const { code } = req.query;
  
  if (!code) {
    console.error('No code received in callback');
    return res.status(400).send('No authorization code received');
  }
  
  try {
    console.log('Getting tokens with code...');
    // Get tokens from code
    const { tokens } = await oauth2Client.getToken(code);
    console.log('Tokens received successfully');
    
    // Update .env.local with the refresh token
    const envPath = path.join(process.cwd(), '.env.local');
    console.log('Reading .env.local file...');
    let envContent = await fs.readFile(envPath, 'utf8');
    
    // Replace the refresh token line or add it if it doesn't exist
    const refreshTokenLine = `GMAIL_REFRESH_TOKEN=${tokens.refresh_token}`;
    if (envContent.includes('GMAIL_REFRESH_TOKEN=')) {
      envContent = envContent.replace(/GMAIL_REFRESH_TOKEN=.*\n/, refreshTokenLine + '\n');
    } else {
      envContent += '\n' + refreshTokenLine + '\n';
    }
    
    console.log('Writing updated .env.local file...');
    await fs.writeFile(envPath, envContent);
    
    console.log('Refresh token has been saved to .env.local');
    
    // Test the connection
    console.log('Testing Gmail connection...');
    oauth2Client.setCredentials(tokens);
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const response = await gmail.users.labels.list({ userId: 'me' });
    console.log('Gmail connection test successful!');
    console.log(`Found ${response.data.labels.length} labels in your Gmail account.`);
    
    res.send(`
      <h1>Authentication Successful!</h1>
      <p>Your Gmail access has been configured successfully.</p>
      <p>You can now close this window and stop the server.</p>
      <p>Found ${response.data.labels.length} labels in your Gmail account.</p>
    `);
  } catch (error) {
    console.error('Error during authentication:', error);
    res.status(500).send(`
      <h1>Authentication Failed</h1>
      <p>Error: ${error.message}</p>
      <p>Please check the console for more details.</p>
    `);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).send('Server error occurred');
});

// Start server
app.listen(port, () => {
  console.log(`\nGmail OAuth2 setup server is running at http://localhost:${port}`);
  console.log('\nPlease follow these steps:');
  console.log('1. Open your browser and visit http://localhost:3001');
  console.log('2. Click the authorization link and sign in with your Google account');
  console.log('3. Grant the requested permissions');
  console.log('4. Wait for the confirmation message\n');
}); 