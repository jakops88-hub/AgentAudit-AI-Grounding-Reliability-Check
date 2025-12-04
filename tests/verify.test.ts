import request from 'supertest';

// Mock env BEFORE importing app
jest.mock('../src/config/env', () => ({
  env: {
    CLIENT_API_KEYS: ['test-api-key'],
    NODE_ENV: 'test',
    OPENAI_API_KEY: 'mock-openai-key', // Added this just in case
  },
}));

// Mock OpenAIProvider
jest.mock('../src/providers/OpenAIProvider', () => {
  return {
    OpenAIProvider: jest.fn().mockImplementation(() => ({})),
  };
});

import app from '../src/app';

// Mock the services to avoid real API calls
jest.mock('../src/services/GroundingService', () => {
  return {
    GroundingService: jest.fn().mockImplementation(() => {
      return {
        verifyGrounding: jest.fn().mockResolvedValue({
          pass: true,
          score: 0.9,
          reason: 'Mocked reasoning',
          unsupported_claims: []
        }),
      };
    }),
  };
});

jest.mock('../src/services/CitationService', () => {
  return {
    CitationService: jest.fn().mockImplementation(() => {
      return {
        verifyCitations: jest.fn().mockResolvedValue({
          pass: true,
          score: 1.0,
          missing_sources: []
        }),
      };
    }),
  };
});

// Mock Prisma to avoid DB writes
jest.mock('../src/config/prisma', () => ({
  __esModule: true,
  default: {
    verificationLog: {
      create: jest.fn().mockResolvedValue({ id: 'mock-uuid' }),
      findMany: jest.fn().mockResolvedValue([]),
    },
  },
}));

describe('AgentAudit API', () => {
  const validApiKey = 'test-api-key';

  describe('GET /health', () => {
    it('should return 200 OK', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });

  describe('POST /api/v1/verify', () => {
    it('should return 401 without API key', async () => {
      const res = await request(app)
        .post('/api/v1/verify')
        .send({
          question: 'Q',
          answer: 'A',
          context: 'C',
        });
      expect(res.status).toBe(401);
    });

    it('should return 200 with valid input and key', async () => {
      const res = await request(app)
        .post('/api/v1/verify')
        .set('x-api-key', validApiKey)
        .send({
          question: 'What is the capital of France?',
          answer: 'Paris is the capital.',
          context: 'France is a country. Paris is its capital.',
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('trust_score');
      expect(res.body.trust_score).toBe(0.92);
      expect(res.body.tests.grounding.score).toBe(0.9);
      expect(res.body.tests.citation.score).toBe(1.0);
    });

    it('should return 400 for missing fields', async () => {
      const res = await request(app)
        .post('/api/v1/verify')
        .set('x-api-key', validApiKey)
        .send({
          question: 'Only question provided',
        });
      expect(res.status).toBe(400);
    });
  });
});
