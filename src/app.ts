import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import globalErrorHandler from './controllers/error';
import financeRouter from './routers/finance';
import paymentRouter from "./routers/payment";
import uploadRouter from './routers/upload';
import userRouter from "./routers/user";
const app = express();

app.use(cors());
app.use('/api/v1/payment/webhook', express.raw({ type: 'application/json' }));

app.use(bodyParser.json());

app.get("/", (req, res) => res.send("Hello from SAINTAI"))
app.use("/api/v1/user", userRouter);
app.use("/api/v1/payment", paymentRouter)
app.use("/api/v1/upload", uploadRouter)
app.use("/api/v1/finance", financeRouter)

// Unhandled Routes:
app.all("*", (req, res, next) => {
  res.status(404).json({
    status: "fail",
    message: `Can't find ${req.originalUrl} on this server`,
  });
});

app.use(globalErrorHandler);

process.on("uncaughtException", (err: any) => {
  console.log("Uncaught Exception, shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});



export default app;