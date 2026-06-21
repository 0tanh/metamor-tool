//load everything
import { join } from "path"

Bun.serve({
  port: 3000,
  fetch(req) {
    // 1. Point to your file
    const filePath = (join(import.meta.dir, "../lib/default_metamor.json"))
    const file = Bun.file(filePath);
    const headers = { 
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Content-Type": "application/json" 
    };
    // 2. Return it as a Response object
    return new Response(file, { headers });
  },
});

console.log("Server running at http://localhost:3000");