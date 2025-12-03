import app from './app';
import { env } from './config/env';

const PORT = env.PORT;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} in ${env.NODE_ENV} mode`);
});
