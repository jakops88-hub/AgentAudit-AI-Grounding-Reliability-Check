import { Router } from 'express';
import { verifyContent, getStats } from '../controllers/verifyController';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

const verifySchema = z.object({
  body: z.object({
    question: z.string().min(1, "Question is required"),
    answer: z.string().min(1, "Answer to verify is required"),
    context: z.union([z.string(), z.array(z.string())]).transform(val => 
      Array.isArray(val) ? val.join('\n\n') : val
    ),
  }),
});

router.post('/verify', validate(verifySchema), verifyContent);
router.get('/stats', getStats);

export default router;
