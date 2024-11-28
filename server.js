import express from "express";
import cors from "cors";
import {connect, getConnection} from "./connection.js"
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";
import projectRouter from "./routes/project.routes.js";
import * as dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

connect().then(()=>{
  app.listen(process.env.PORT, ()=>{
    console.log(`Server is running on port ${process.env.PORT}`);
  })
}).catch((err)=>{
  console.log('Error has been occured: ',err);
  process.exit(1);
});

// centralized error handler
app.use((err, req, res, next)=> {
  console.error(err);
  res.status(500).send('Something went wrong!');
});

app.use('/api/user', userRouter);
app.use('/api/project', projectRouter);