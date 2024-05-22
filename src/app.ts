import express from 'express'

import userRouter from "./routers/user"
import globalErrorHandler from './controllers/error';

const app = express();
app.use(express.json());

app.use("/api/v1/user", userRouter);


// Unhandled Routes:
app.all("*", (req, res, next) => {
    res.status(404).json({
        status: "fail",
        message: `Can't find ${req.originalUrl} on this server`,
    });
});

app.use(globalErrorHandler);

export default app;