# Aurora-Applied-AI-ML-Assessment

Create: aurora-qa-system/README.md

# Aurora QA System

A natural language question-answering system that answers questions about member data from a public API.

## 🎯 Project Overview

This system accepts natural-language questions via a REST API and returns answers by analyzing member messages. It
demonstrates real-world API integration, caching strategies, error handling, and natural language processing techniques.

## 🚀 Features

- **Natural Language Processing**: Parses questions using regex pattern matching
- **Intelligent Caching**: In-memory cache reduces API calls and improves performance
- **Graceful Error Handling**: Handles API rate limits, timeouts, and network errors
- **Pattern-Based Question Answering**: Supports multiple question types
- **Production-Ready**: Type-safe TypeScript with comprehensive error handling

## 📋 Supported Question Types

The system can answer the following types of questions:

1. **Trip Planning**: "When is [Name] planning their trip to [Location]?"
2. **Quantity Queries**: "How many [items] does [Name] have?"
3. **Favorites**: "What are [Name]'s favorite [things]?"
4. **Preferences**: "What does [Name] prefer?"

### Example Questions

- "When is Layla planning her trip to London?"
- "How many cars does Vikram Desai have?"
- "What are Sophia's favorite restaurants?"
- "What does Fatima prefer?"

## 🏗️ Architecture

┌─────────────┐
│ Client │
└──────┬──────┘
│ POST /api/ask
│ { "question": "..." }
▼
┌─────────────────────────┐
│ Next.js API Route │
│ (/api/ask) │
└──────┬──────────────────┘
│
▼
┌─────────────────────────┐
│ Question Parser │
│ (Regex Pattern Match) │
└──────┬──────────────────┘
│
▼
┌─────────────────────────┐
│ Message Service │
│ (Cache + External API) │
└──────┬──────────────────┘
│
▼
┌─────────────────────────┐
│ Answer Generator │
│ (Context Analysis) │
└──────┬──────────────────┘
│
▼
┌─────────────────────────┐
│ JSON Response │
│ { "answer": "..." } │
└─────────────────────────┘

## 🛠️ Technology Stack

- **Language**: TypeScript 5.x
- **Framework**: Next.js 16.0.1 (App Router)
- **Runtime**: Node.js
- **HTTP Client**: Axios 1.13.2
- **External API**: Member Messages API

## 📁 Project Structure

aurora-qa-system/
├── src/
│ ├── app/
│ │ └── api/
│ │ └── ask/
│ │ └── route.ts # Main API endpoint
│ ├── lib/
│ │ └── config.ts # Configuration management
│ ├── services/
│ │ └── messages.service.ts # Data fetching & caching
│ ├── types/
│ │ └── api.types.ts # TypeScript type definitions
│ └── utils/ # Utility functions (future)
├── .env.local # Environment variables (not in repo)
├── package.json
├── tsconfig.json
└── README.md

## 🔧 Setup Instructions

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd aurora-qa-system

   ```

2. Install dependencies
   npm install
3. Configure environment variables

4. Create a .env.local file in the root directory:
   EXTERNAL_API_BASE_URL=https://november7-730026606190.europe-west1.run.app
   EXTERNAL_API_TIMEOUT=30000
5. Start development server
   npm run dev
6. Access the API

7. The server will start at http://localhost:3000

🧪 Testing the API

Using cURL

curl -X POST http://localhost:3000/api/ask \
 -H "Content-Type: application/json" \
 -d '{"question": "When is Layla planning her trip to London?"}'

Expected Response

{
"answer": "Layla is planning a trip to London..."
}

Error Response

{
"error": "Invalid request",
"details": "Question field is required and must be a string"
}

🎯 Implementation Details

Caching Strategy

- In-Memory Cache: Stores fetched messages for the lifetime of the server process
- Lazy Loading: Fetches data on first request, serves from cache afterwards
- Pagination Handling: Fetches messages in batches of 50 until API limit is reached
- Performance: First request ~3-5s, subsequent requests <100ms

Error Handling

The system gracefully handles:

- API Rate Limits: Uses partial data when pagination limits are reached
- Timeouts: Retries up to 3 times with exponential backoff
- Network Errors: Falls back to cached data when available
- Invalid Questions: Returns helpful error messages

Question Parsing

Uses regex pattern matching to extract:

- User names: Case-insensitive matching
- Locations/Items: Context extraction
- Question type: Routes to appropriate answer logic

📊 Performance Characteristics

- First Request: 3-5 seconds (fetches and caches data)
- Subsequent Requests: <100ms (served from cache)
- Cache Size: 650 messages (100KB in memory)
- Concurrent Requests: Prevents duplicate fetches with locking mechanism

🔒 Security Considerations

- Environment Variables: Sensitive data stored in .env.local
- Input Validation: All requests validated before processing
- Type Safety: TypeScript prevents many runtime errors
- Error Sanitization: Error messages don't expose internal details

🚀 Deployment

Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

Environment Variables for Production

EXTERNAL_API_BASE_URL=<api-url>
EXTERNAL_API_TIMEOUT=30000

🧩 API Limitations & Workarounds

Observed Limitations

1. Pagination Limit: API returns 4xx errors after ~650 messages
2. Rate Limiting: Different error codes (401, 402, 405) indicate rate limits
3. Trailing Slash Required: API strict about URL format (/messages/ not /messages)

Implemented Solutions

- Graceful degradation when pagination limits are hit
- Retry logic for transient failures
- Comprehensive error logging for debugging

📈 Future Enhancements

- OpenAI integration for advanced NLP
- Redis cache for distributed deployments
- GraphQL API for flexible queries
- Real-time question suggestions
- Fuzzy name matching for typos
- Analytics dashboard
- Rate limiting for public API
- Unit and integration tests

🤝 Contributing

This is an assessment project. Contributions are not currently accepted.

📄 License

This project is for educational/assessment purposes.

👤 Author

Ashish Parulekar
