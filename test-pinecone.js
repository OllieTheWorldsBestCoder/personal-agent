require('dotenv').config();
const { Pinecone } = require('@pinecone-database/pinecone');

async function testPineconeConnection() {
  try {
    console.log('Initializing Pinecone client...');
    console.log('API Key:', process.env.PINECONE_API_KEY ? '✓ Found' : '✗ Missing');
    
    const pc = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY
    });

    console.log('\nConnecting to personal-agent index...');
    const index = pc.index('personal-agent');
    
    console.log('\nTesting index connection...');
    const stats = await index.describeIndexStats();
    console.log('Index stats:', JSON.stringify(stats, null, 2));

    // Try a simple query
    console.log('\nTesting query...');
    const queryResponse = await index.query({
      vector: Array(1536).fill(0.1),
      topK: 1,
      includeMetadata: true
    });
    console.log('Query response:', JSON.stringify(queryResponse, null, 2));

  } catch (error) {
    console.error('Error:', error.message);
    console.error('Full error:', error);
  }
}

console.log('Starting Pinecone connection test...');
testPineconeConnection(); 