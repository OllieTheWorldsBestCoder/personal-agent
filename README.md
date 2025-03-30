# Personal AI Agent

A personal AI assistant that helps manage emails, provides news updates, and maintains a memory system using the latest AI models.

## Features

- Email management with Gmail integration
- Daily news updates via WhatsApp
- Voice note summaries
- Memory system using Pinecone vector database
- WhatsApp integration using Twilio
- Powered by Claude and GPT-4

## Prerequisites

- Node.js 18+
- npm or yarn
- Gmail account with API access
- Twilio account with WhatsApp capabilities
- Pinecone account
- OpenAI API key
- Anthropic API key

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Gmail
GMAIL_CLIENT_ID=your_client_id
GMAIL_CLIENT_SECRET=your_client_secret
GMAIL_REFRESH_TOKEN=your_refresh_token

# Twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone
TWILIO_USER_PHONE_NUMBER=your_phone_number

# Pinecone
PINECONE_API_KEY=your_api_key
PINECONE_ENVIRONMENT=your_environment

# OpenAI
OPENAI_API_KEY=your_api_key

# Anthropic
ANTHROPIC_API_KEY=your_api_key

# News API
NEWS_API_KEY=your_api_key

# Cron
CRON_SECRET=your_cron_secret
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/personal-agent.git
cd personal-agent
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

4. Run the development server:
```bash
npm run dev
```

## Deployment

The project is configured for deployment on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## API Routes

### WhatsApp Webhook
- Endpoint: `/api/webhook/whatsapp`
- Method: POST
- Handles incoming WhatsApp messages

### Daily Update
- Endpoint: `/api/cron/daily-update`
- Method: POST
- Requires Bearer token authentication
- Triggers daily news update

## Development

### Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   └── page.tsx           # Home page
├── lib/                   # Core functionality
│   ├── ai/               # AI client
│   ├── email/            # Email client
│   ├── memory/           # Memory system
│   ├── news/             # News client
│   └── whatsapp/         # WhatsApp client
└── types/                # TypeScript types
```

### Adding New Features

1. Create new client in `src/lib/`
2. Add configuration in `src/lib/config.ts`
3. Update orchestrator in `src/lib/orchestrator.ts`
4. Add API routes if needed

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT 