// server.js
const http = require("http");
const url = require("url");
require("dotenv").config();

const askChatGPT = require("./chatgpt");

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);

  //  CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  //  Preflight request
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  //  Health check
  if (req.method === "GET" && parsedUrl.pathname === "/") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("MedicBot backend running");
    return;
  }

  //  Chat route
  if (req.method === "POST" && parsedUrl.pathname === "/chat") {
    let body = "";

    req.on("data", chunk => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      try {
        const data = JSON.parse(body);
        const message = data.message;

        if (!message) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Message is required" }));
          return;
        }

        const reply = await askChatGPT(message);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ reply }));

      } catch (err) {
        console.error("Chat route error:", err);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Internal server error" }));
      }
    });

    return;
  }

  //  404
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Route not found");
});

const PORT = 5001;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
