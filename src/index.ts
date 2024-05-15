import app from './app';
import dotenv from 'dotenv';

dotenv.config();

// Port:
const PORT = process.env.PORT || 5000;

// Listen:
const server = app.listen(PORT, () =>
  console.log(
    `Server running on port ${PORT} Environment: ${process.env.NODE_ENV}`
  )
);