// @ts-nocheck
import { NextApiRequest, NextApiResponse } from "next";
import { testConnection, manualSync } from "../../utils/hubspotTest";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { action, limit } = req.body;

  try {
    switch (action) {
      case "test":
        await testConnection();
        res.status(200).json({ message: "Connection test completed" });
        break;

      case "sync":
        await manualSync(limit || 10);
        res.status(200).json({ message: "Manual sync completed" });
        break;

      default:
        res.status(400).json({ message: "Invalid action" });
    }
  } catch (error) {
    console.error("API error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
