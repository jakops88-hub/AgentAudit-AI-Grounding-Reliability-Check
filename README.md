# AgentAudit

**Enterprise-grade middleware for detecting AI hallucinations and enforcing reliability in RAG systems.**

AgentAudit acts as a semantic firewall between your AI agents and your end users. It intercepts generated responses and verifies them against the retrieved source context in real-time using a specialized "Judge LLM" architecture.

Unlike naive RAG implementations that assume "Good Retrieval = Good Answer", AgentAudit programmatically detects ungrounded claims, citation errors, and contradictions before they reach production.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fjakops88-hub%2FAgentAudit)

## Live Demo

Access the verification dashboard to test the engine against your own data:

**[Launch Live Dashboard]((https://agentaudit-dashboard.vercel.app/))**

![AgentAudit Dashboard](https://github.com/user-attachments/assets/a27db792-e18d-4890-9af0-ed09e97387ca)

## Architecture & Stack

The system is built as a stateless microservice designed for high throughput and low latency (~200ms).

* **Runtime:** Node.js (Express)
* **Language:** TypeScript (Strict mode)
* **Database:** PostgreSQL (via Vercel Postgres / Neon)
* **Vector Engine:** pgvector (for semantic comparison)
* **ORM:** Prisma
* **Validation:** Zod
* **Documentation:** OpenAPI 3.0 / Swagger

## Core Features

* **Grounding Verification:** Validates that every specific claim in the AI response is supported by the provided context chunks.
* **Citation Enforcement:** Checks if referenced sources exist and if the cited text actually supports the statement.
* **Audit Logging:** Persists every verification event to PostgreSQL for compliance and long-term accuracy tracking.
* **Retry Suggestions:** Returns structured, actionable instructions on how to fix a rejected response (enabling self-healing agent loops).
* **Security:** Built-in API Key authentication, Rate Limiting, and Helmet security headers.

## Getting Started

### Prerequisites

* Node.js 18+
* PostgreSQL Database (Local or Cloud)
* OpenAI API Key

### Installation

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/jakops88-hub/AgentAudit.git](https://github.com/jakops88-hub/AgentAudit.git)
    cd AgentAudit
    npm install
    ```

2.  **Environment Configuration**
    Copy `.env.example` to `.env` and populate the required keys:
    ```env
    PORT=3000
    NODE_ENV="development"
    
    # AI Provider
    OPENAI_API_KEY="sk-..."
    
    # Security (Comma separated list of allowed client keys)
    CLIENT_API_KEYS="sk_dev_key_123"
    
    # Database (Prisma supports pooling and direct connections)
    DATABASE_URL="postgres://..."
    DIRECT_URL="postgres://..."
    ```

3.  **Database Migration**
    Initialize the database schema:
    ```bash
    npx prisma migrate dev
    ```

4.  **Start Server**
    ```bash
    npm run dev
    ```
    The API will be available at `http://localhost:3000`.
    Swagger Documentation is available at `http://localhost:3000/api-docs`.

## API Reference

### POST /api/v1/verify

Verifies an AI response against a given context.

**Headers:**
* `Content-Type: application/json`
* `x-api-key: <YOUR_CLIENT_KEY>`

**Request Body:**

```json
{
  "question": "What is the capital of France?",
  "answer": "Paris is the capital and has a population of 15 million.",
  "context": "Paris is the capital of France. The population is approximately 2.1 million."
}
```

**Success Response (200 OK):**

```json
{
  "trust_score": 0.4,
  "action": "REJECT",
  "tests": {
    "grounding": {
      "pass": false,
      "score": 0.4,
      "reason": "The claim about population contradicts the context.",
      "unsupported_claims": [
        "population of 15 million"
      ]
    }
  },
  "retry_suggestion": "Remove the claim 'population of 15 million'. Correct it to '2.1 million' based on context."
}
```

## Deployment

This project is optimized for Serverless deployment on Vercel.

1.  Fork this repository.
2.  Import the project in Vercel.
3.  Configure the Environment Variables (`OPENAI_API_KEY`, `CLIENT_API_KEYS`).
4.  Connect a Vercel Postgres database (Storage tab).
5.  Deploy.

## License

MIT License.
