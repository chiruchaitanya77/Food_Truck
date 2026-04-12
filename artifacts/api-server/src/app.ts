import express, { type Express, Request } from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Express = express();

// ✅ Trust proxy (safe default for local + deployments like Replit, Nginx, etc.)
app.set("trust proxy", true);

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ✅ Normalize IP middleware
app.use((req: Request, _res, next) => {
	let ip = req.ip || req.socket.remoteAddress || "";

	// Convert IPv6 localhost to IPv4
	if (ip === "::1") ip = "127.0.0.1";

	// Convert IPv4-mapped IPv6 → IPv4
	if (ip.startsWith("::ffff:")) {
		ip = ip.replace("::ffff:", "");
	}

	// Attach clean IP
	(req as any).clientIp = ip;

	next();
});

// ✅ Serve uploaded images
const uploadsDir = path.join(__dirname, "..", "uploads");
app.use("/uploads", express.static(uploadsDir));

// ✅ Routes
app.use("/api", router);

export default app;
