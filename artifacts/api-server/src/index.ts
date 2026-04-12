// import app from "./app";
//
// const rawPort = process.env["PORT"];
//
// if (!rawPort) {
//   throw new Error(
//     "PORT environment variable is required but was not provided.",
//   );
// }
//
// const port = Number(rawPort);
//
// if (Number.isNaN(port) || port <= 0) {
//   throw new Error(`Invalid PORT value: "${rawPort}"`);
// }
//
// app.listen(port, () => {
//   console.log(`Server listening on port ${port}`);
// });


import dotenv from "dotenv";
import path from "path";

// ✅ Load env (same as db)
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });

import app from "./app";

// ✅ Provide fallback (important for dev)
const rawPort = process.env["PORT"] ?? "8000";

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, "0.0.0.0", () => {
  console.log(`Server listening on port ${port}`);
});
