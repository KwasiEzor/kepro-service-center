import express from 'express';
import { validateEnv } from './env';
import chatRouter from './api';

validateEnv();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use('/api', chatRouter);

app.listen(PORT, () => {
  console.log(`✅ API server on http://localhost:${PORT}`);
});
