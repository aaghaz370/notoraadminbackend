import Donation from "../models/Donation.js";
import Book from "../models/Book.js";
import User from "../models/User.js";

// 📥 User donates a book
export const createDonation = async (req, res) => {
  try {
    const user = req.user;
    const { name, author, genre, rating, thumbnail, pdfUrl } = req.body;

    if (!name || !author || !genre || !rating || !thumbnail || !pdfUrl)
      return res.status(400).json({ message: "All fields are required." });

    const donation = await Donation.create({
      name,
      author,
      genre,
      rating,
      thumbnail,
      pdfUrl,
      userEmail: user.email,
      status: "Pending",
    });

    res.status(201).json(donation);
  } catch (err) {
    console.error("Donation create error:", err);
    res.status(500).json({ message: "Failed to donate book." });
  }
};

// 📄 Get all pending donations (Admin only)
export const getDonations = async (req, res) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 });
    res.json(donations);
  } catch (err) {
    res.status(500).json({ message: "Failed to load donations." });
  }
};

// 🧾 Verify & approve donation (Admin)
export const verifyDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: "Donation not found." });

    // Add to main Books collection
    const newBook = await Book.create({
      name: donation.name,
      author: donation.author,
      genre: donation.genre,
      rating: donation.rating,
      thumbnail: donation.thumbnail,
      pdfUrl: donation.pdfUrl,
    });

    // Reward user with +5 NT
    const user = await User.findOne({ email: donation.userEmail });
    if (user) {
      user.achievements.points += 5;
      await user.save();
    }

    // Delete the donation (or mark verified)
    await Donation.findByIdAndDelete(req.params.id);

    res.json({ message: "Donation verified and added!", book: newBook });
  } catch (err) {
    console.error("Verify donation error:", err);
    res.status(500).json({ message: "Verification failed." });
  }
};

// ✏️ Edit donation
export const updateDonation = async (req, res) => {
  try {
    const updated = await Donation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Donation not found." });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Update failed." });
  }
};

// ❌ Delete donation
export const deleteDonation = async (req, res) => {
  try {
    const deleted = await Donation.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Donation not found." });
    res.json({ message: "Donation deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: "Delete failed." });
  }
};
