import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Personal AI Agent</h1>
        
        <div className="prose lg:prose-xl">
          <p className="text-lg mb-6">
            Your personal AI assistant that helps manage emails, provides news updates, and maintains a memory system using the latest AI models.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Features</h2>
          <ul className="list-disc pl-6 mb-6">
            <li>Email management with Gmail integration</li>
            <li>Daily news updates via WhatsApp</li>
            <li>Voice note summaries</li>
            <li>Memory system using Pinecone vector database</li>
            <li>WhatsApp integration using Twilio</li>
            <li>Powered by Claude and GPT-4</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">API Documentation</h2>
          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <h3 className="text-xl font-semibold mb-2">WhatsApp Webhook</h3>
            <p className="mb-2">Endpoint: <code>/api/webhook/whatsapp</code></p>
            <p className="mb-2">Method: POST</p>
            <p>Handles incoming WhatsApp messages</p>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <h3 className="text-xl font-semibold mb-2">Daily Update</h3>
            <p className="mb-2">Endpoint: <code>/api/cron/daily-update</code></p>
            <p className="mb-2">Method: POST</p>
            <p>Requires Bearer token authentication</p>
            <p>Triggers daily news update</p>
          </div>

          <div className="mt-8">
            <Link
              href="https://github.com/yourusername/personal-agent"
              className="text-blue-600 hover:underline"
              target="_blank"
            >
              View on GitHub →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
} 