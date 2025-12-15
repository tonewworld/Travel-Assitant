import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { config } from "./config/config";
import chatRouter from "./routes/chat";
import itineraryRouter from "./routes/itinerary";
import exportRouter from "./routes/export";

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use("/api", chatRouter);
app.use("/api", itineraryRouter);
app.use("/api", exportRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(config.port, () => {
  console.log(`Travel Assistant backend listening on port ${config.port}`);
});