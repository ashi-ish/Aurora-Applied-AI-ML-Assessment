
# Aurora QA System

Minimal Next.js + TypeScript app for answering natural-language questions about member messages.

## Features
- REST API: `POST /api/ask` — ask questions, get answers
- Caches messages from external API for fast responses
- Regex-based question parsing ("When is Layla planning her trip to London?")

## Quick Start
1. `cd aurora-qa-system`
2. `npm install`
3. Create `.env.local`:
   ```env
   EXTERNAL_API_BASE_URL=https://november7-730026606190.europe-west1.run.app
   EXTERNAL_API_TIMEOUT=30000
   ```
4. `npm run dev` — app runs at http://localhost:3000

## API Example
```bash
curl -X POST http://localhost:3000/api/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"When is Layla planning her trip to London?"}'
```
Response:
```json
{ "answer": "Layla is planning a trip to London on ..." }
```

## Key Files
- `src/app/api/ask/route.ts` — API endpoint & logic
- `src/services/messages.service.ts` — fetch/cache messages
- `src/lib/config.ts` — loads environment variables
- `tsconfig.json` — path alias: `@/*` → `src/*`

## Troubleshooting
**Cannot find module '@/lib/config'**
- Restart your editor/TypeScript server
- Make sure your editor uses the workspace TypeScript
- For scripts outside Next.js, use `tsconfig-paths` or switch to relative imports

## Improvements
- Add tests (Jest/Vitest)
- Use Redis for persistent cache
- Integrate LLM for smarter answers

## Author
Ashish Parulekar


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


  ---

  ## 📝 BONUS 1: Design Notes — Alternative Approaches

  During development, several alternative QA approaches were considered:

  ### 1. OpenAI GPT Integration

  **Description:** Use OpenAI GPT models to understand questions and generate answers from context.

  ```typescript
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are a QA assistant..." },
      { role: "user", content: question },
    ],
    context: JSON.stringify(messages)
  });
  ```
  **Pros:**
  - Handles natural language variations
  - Understands context better
  - Handles typos and rephrasing
  - Can answer complex questions
  - Continuously improving models

  **Cons:**
  - External API dependency (cost + latency)
  - Non-deterministic responses
  - Requires API key management
  - Slower response times (~1–3s/request)
  - Monthly costs based on usage

  **Best for:** Production systems needing conversational, flexible QA.

  ---

  ### 2. Fine-Tuned Model

  **Description:** Train a custom model for this dataset and question types.

  ```typescript
  // Fine-tune GPT-3.5 on question-answer pairs
  const fineTune = await openai.fineTuning.jobs.create({
    training_file: "file-abc123",
    model: "gpt-3.5-turbo"
  });

  // Use fine-tuned model
  const response = await openai.chat.completions.create({
    model: fineTune.fine_tuned_model,
    messages: [{ role: "user", content: question }]
  });
  ```
  **Pros:**
  - Optimized for specific use case
  - Better accuracy than generic models
  - Lower latency
  - Potentially lower cost per query

  **Cons:**
  - Requires labeled training data
  - Time-intensive setup
  - Needs retraining for new patterns
  - Upfront cost

  **Best for:** High-volume, consistent QA with available training data.

  ---

  ## 📊 BONUS 2: Data Analysis — Anomalies & Inconsistencies

  Analysis of the member messages dataset (650 cached) revealed:

  ### Dataset Overview
  - **Total Messages:** 3,349
  - **Messages Cached:** 650 (API pagination limit)
  - **Unique Users:** ~12–15
  - **Date Range:** 2024-11-14 to 2025-11-04
  - **Types:** Requests, preferences, feedback, updates

  ---

  ### 🚨 Anomaly 1: Future Timestamps
  Many messages have timestamps in the future (2025 dates).

  **Impact:**
  - Trip planning questions may return confusing dates
  - "When" questions need temporal context awareness
  - Date validation/normalization may be needed

  **Recommendation:**
  - Add date normalization layer
  - Handle relative dates ("this Friday" vs absolute)
  - Consider message timestamp vs mentioned dates

  ---

  ### 🚨 Anomaly 2: Inconsistent Pagination Behavior
  API returns different HTTP error codes for pagination limits.

  **Observed:**
  - Skip 0–600: 200 OK
  - Skip 650: 405 Method Not Allowed
  - Skip 700: 401 Unauthorized
  - Skip 850: 402 Payment Required
  - Skip 1000: 404 Not Found

  **Impact:**
  - Cannot rely on specific error codes
  - Must handle all 4xx errors as pagination limits

  **Implementation:**
  ```typescript
  // Treat all 4xx as pagination limit
  if (status && status >= 400 && status < 500) {
    console.log(`API pagination limit. Using ${allMessages.length} messages.`);
    hasMore = false;
  }
  ```

  ---

  ### 🚨 Anomaly 3: Ambiguous User Information
  Questions reference users that may not exist or are ambiguous.

  **Example:**
  - Question: "What are Amira's favorite restaurants?"
  - Dataset: Contains "Amina Van Den Berg" but no "Amira"

  **Impact:**
  - Typos or missing users
  - Fuzzy matching could help (Levenshtein distance)

  **Recommendation:**
  ```typescript
  function findSimilarNames(query: string, threshold: number = 0.8): string[] {
    return allUsers.filter(name => similarity(name, query) >= threshold);
  }
  // Suggest corrections
  if (userMessages.length === 0) {
    const suggestions = findSimilarNames(userName);
    return `Did you mean: ${suggestions.join(', ')}?`;
  }
  ```

  ---

  ### 🚨 Anomaly 4: Vague Quantity References
  "How many X" questions are difficult to answer accurately.

  **Example:** "How many cars does Vikram Desai have?"

  **Impact:**
  - Messages mention usage, not ownership
  - System may give incorrect counts or none

  **Current Implementation:**
  ```typescript
  if (numbers.length > 0) {
    const count = Math.max(...numbers);
    return `${userName} has ${count} ${searchTerm}.`;
  }
  return `I found mentions of ${searchTerm} but couldn't determine count.`;
  ```

  **Recommendation:**
  - Add context validation (ownership vs usage)
  - Use entity-relationship extraction
  - Be explicit about uncertainty

  ---

  ### 🚨 Anomaly 5: Duplicate/Similar Messages
  Multiple users have nearly identical preference messages.

  **Impact:**
  - Helps pattern matching
  - May not reflect real-world complexity

  ---

  ### 🚨 Anomaly 6: Microsecond Precision in Timestamps
  Timestamps have unrealistic microsecond precision.

  **Impact:**
  - No impact on QA functionality
  - Useful insight about data source

🤝 Contributing

This is an assessment project. Contributions are not currently accepted.

📄 License

This project is for educational/assessment purposes.

👤 Author

Ashish Parulekar
