import app from './app';
import dotenv from 'dotenv';
import { mongoConnect } from './config/mongo.connect';
import { startCronJobs } from './cron';

dotenv.config();

//Connect to MongoDB:
mongoConnect(process.env.MONGO_URI!);

// Port:
const PORT = process.env.PORT || 5000;

startCronJobs();

// Listen:
const server = app.listen(PORT, () =>
  console.log(
    `Server running on port ${PORT} Environment: ${process.env.NODE_ENV}`
  )
);