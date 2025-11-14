import BuyRequest from "../models/BuyRequest.js";
import User from "../models/User.js";

// Helper: send Telegram message (uses global fetch available in Node 18+)
async function sendTelegramMessage(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.warn("Telegram credentials missing. Skipping send.");
    return;
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const body = {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
  };

  // Node 18+ has global fetch. If not available, install node-fetch and import fetch.
  if (typeof fetch === "undefined") {
    // Optionally: npm i node-fetch and uncomment next line:
    // const fetch = (await import('node-fetch')).default;
    throw new Error("fetch is not available. Install node 18+ or add node-fetch.");
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

export const createBuyRequest = async (req, res) => {
  try {
    const userId = req.user._id;
    const { itemId, itemName, cost, note } = req.body;

    if (!itemName || !cost) return res.status(400).json({ message: "Missing itemName or cost" });

    // Create DB record
    const br = await BuyRequest.create({
      userId,
      email: req.user.email,
      itemId: itemId || null,
      itemName,
      cost,
      note: note || "",
      meta: { ip: req.ip, ua: req.get("User-Agent") },
    });

    // Prepare Telegram message (HTML)
    const message = `<b>🎯 New Store Request</b>\n\n` +
      `<b>User:</b> ${req.user.email}\n` +
      `<b>Item:</b> ${itemName}\n` +
      `<b>Cost:</b> ${cost} NT\n` +
      (note ? `<b>Note:</b> ${note}\n` : "") +
      `<b>Request ID:</b> ${br._id}\n` +
      `<b>Time:</b> ${new Date(br.createdAt).toLocaleString()}\n\n` +
      `Use your NT panel to approve & deduct points.`;

    // Send Telegram (don't crash app on failure)
    try {
      await sendTelegramMessage(message);
    } catch (tgErr) {
      console.error("Telegram send error:", tgErr);
      // continue — request is saved to DB
    }

    res.json({ success: true, request: br, message: "Buy request created and sent to admin." });
  } catch (err) {
    console.error("Create buy request error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Optional: list all requests (admin-only)
// You can wire this to a protected/admin route to view pending requests
export const listBuyRequests = async (req, res) => {
  try {
    // If you want only admin access, check req.user.isAdmin
    if (!req.user?.isAdmin) return res.status(403).json({ message: "Admin only" });
    const items = await BuyRequest.find().sort({ createdAt: -1 }).limit(200).lean();
    res.json({ success: true, items });
  } catch (err) {
    console.error("List buy requests error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
