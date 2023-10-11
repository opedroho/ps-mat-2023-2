import express, { json, urlencoded } from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";
import dotenv from 'dotenv'
import protectRoutes from './lib/protectRoutes.js'

import cors from 'cors'

import indexRouter from "./routes/index.js";
import usersRouter from "./routes/users.js";

// Importa as variáveis de ambiente do arquivo .env
dotenv.config()

const app = express();

app.use(cors({
  origin: process.env.FRONT_ORIGIN,
  credentials: true
}))

app.use(logger("dev"));
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/", indexRouter);
app.use("/users", usersRouter);

/////////////////////////////////////////////////

// Protege as rotas, exigindo autenticação prévia
app.use(protectRoutes)

import carRouter from './routes/car.js'
app.use('/car', carRouter)

import customerRouter from './routes/customer.js'
app.use('/customer', customerRouter)

import userRouter from './routes/user.js'
app.use('/user', userRouter)

export default app;
