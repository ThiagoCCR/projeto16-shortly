import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import usersRouter from "./routers/usersRouters.js";
import urlRouter from "./routers/urlRouters.js";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use(usersRouter);
app.use(urlRouter);

app.listen(process.env.PORT, () => {
  console.log("Server running on port " + process.env.PORT);
});
