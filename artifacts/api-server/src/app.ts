import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Express = express();

const isProduction = process.env.NODE_ENV === "production";

app.use(cors({
  origin: isProduction
    ? (process.env.FRONTEND_URL || true)
    : true,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api", router);

if (isProduction) {
  const frontendDist = path.resolve(__dirname, "../../khtat-sairak/dist/public");

  if (fs.existsSync(frontendDist)) {
    app.use(express.static(frontendDist));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(frontendDist, "index.html"));
    });
  } else {
    console.warn("⚠️  Frontend dist not found at:", frontendDist);
  }
}

export default app;
