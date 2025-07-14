// server.js
import { app } from "./app.js";

// Use port from config or default
const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is working on port ${PORT}`);
});
