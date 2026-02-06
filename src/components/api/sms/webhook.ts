import ComplianceSMSService from "../../../services/sms/ComplianceSMSService";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { From, Body } = req.body;

    // TODO: validate Twilio signature before processing
    await ComplianceSMSService.processIncomingSMS(From, Body);

    res
      .status(200)
      .send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
