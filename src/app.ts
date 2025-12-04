import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import verifyRoutes from './routes/verifyRoutes';
import { authenticateApiKey } from './middleware/auth';

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/v1', authenticateApiKey, verifyRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default app;
