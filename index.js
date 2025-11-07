import express from "express";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: ["https://notoraadmin.netlify.app"], // 👈 yahan apna frontend domain likho
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
