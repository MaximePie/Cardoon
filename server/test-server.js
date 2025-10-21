// Test server to debug connectivity issues
import express from "express";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Test server is working" });
});

app.post("/api/users/login", (req, res) => {
  console.log("Login request received:", req.body);
  res.json({
    token: "test-token-123",
    user: { id: "test-user", username: "test" },
  });
});

const port = 3002;
const server = app.listen(port, "0.0.0.0", () => {
  console.log(`Test server running on port ${port}`);
});

server.on("error", (err) => {
  console.error("Server error:", err);
});
