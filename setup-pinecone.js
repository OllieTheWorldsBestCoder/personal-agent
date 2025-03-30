require('dotenv').config();
const { Pinecone } = require('@pinecone-database/pinecone');

async function setupPineconeIndex() {
  try {
    // Validate environment variables
    if (!process.env.PINECONE_API_KEY) {
      throw new Error('PINECONE_API_KEY is not set');
    }

    // Use AWS us-east-1 for free tier
    const environment = 'us-east-1-aws';
    console.log(`Using Pinecone environment: ${environment}`);

    console.log('Initializing Pinecone client...');
    const pc = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
      environment: environment
    });

    const indexName = 'personal-agent';
    
    try {
      // Check if index already exists
      console.log('Fetching existing indexes...');
      const indexes = await pc.listIndexes();
      console.log('Current indexes:', indexes);
      
      if (indexes.includes(indexName)) {
        console.log(`Index '${indexName}' already exists`);
        const index = pc.index(indexName);
        const stats = await index.describeIndexStats();
        console.log('Index stats:', stats);
        return;
      }
    } catch (listError) {
      console.error('Error listing indexes:', listError.message);
      throw listError;
    }

    console.log(`Creating index '${indexName}'...`);
    try {
      // Create index with minimal configuration
      await pc.createIndex({
        name: indexName,
        dimension: 1536,
        metric: 'cosine'
      });
      
      console.log('Index creation initiated!');
      
      // Wait for the index to be ready
      console.log('Waiting for index to be ready...');
      let isReady = false;
      let retries = 0;
      const maxRetries = 10;
      
      while (!isReady && retries < maxRetries) {
        try {
          const index = pc.index(indexName);
          const stats = await index.describeIndexStats();
          console.log('Index stats:', stats);
          isReady = true;
        } catch (error) {
          console.log(`Waiting for index to be ready (attempt ${retries + 1}/${maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
          retries++;
        }
      }
      
      if (!isReady) {
        throw new Error('Index failed to become ready after maximum retries');
      }
      
      console.log('Index is ready!');
    } catch (createError) {
      console.error('Error creating index:', createError.message);
      if (createError.response) {
        console.error('Response:', createError.response.data);
      }
      throw createError;
    }
  } catch (error) {
    console.error('Error setting up Pinecone index:', error.message);
    if (error.message.includes('fetch failed')) {
      console.error('Network error - please check your internet connection');
    } else if (error.message.includes('401')) {
      console.error('Authentication error - please check your API key');
    } else if (error.message.includes('403')) {
      console.error('Authorization error - please check your API key permissions');
    }
    process.exit(1);
  }
}

setupPineconeIndex(); 