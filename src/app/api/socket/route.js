// app/api/socket/route.js
import { NextResponse } from "next/server";

// Socket.IO is set up in a custom server file (see server.js)
// This endpoint is just for health checking the API

export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "WebSocket server is running",
  });
}
