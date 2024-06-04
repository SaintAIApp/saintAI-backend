import express from 'express'
import globalErrorHandler from './controllers/error';
import bodyParser from 'body-parser';
import userRouter from "./routers/user"
import paymentRouter from "./routers/payment"
import cors from 'cors'
const app = express();

app.use(cors());
app.use('/api/v1/payment/webhook', express.raw({ type: 'application/json' }));

app.use(bodyParser.json());
app.get("/",(req,res)=>res.send("Hello from SAINTAI"))
app.use("/api/v1/user", userRouter);
app.use("/api/v1/payment", paymentRouter)


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