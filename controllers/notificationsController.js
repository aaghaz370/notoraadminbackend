import Notification from "../models/Notification.js";
import User from "../models/User.js";

export const sendNotification = async (req, res) => {
  try {
    const { type, title, message, target, userList } = req.body;

    if (!title || !message)
      return res.status(400).json({ message: "Title & message required" });

    let userIds = [];

    // 🔥 Target Logic
    if (target === "all") {
      const allUsers = await User.find({}, "_id");
      userIds = allUsers.map(u => u._id);
    } else if (target === "group") {
      userIds = userList;
    } else if (target === "single") {
      userIds = [userList];
    }

    const notif = await Notification.create({
      title,
      message,
      type,
      userIds
    });

    res.json({ success: true, notif });

  } catch (err) {
    console.error("Notification Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// USER will fetch notifications
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const notifs = await Notification.find({
      userIds: userId
    }).sort({ createdAt: -1 });

    res.json({ notifications: notifs });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
