import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false, // hides password in API responses
    },
    bookmarks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
      },
    ],
   achievements: {
  readCount: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  points: { type: Number, default: 0 },
  lastActive: { type: Date },
},

  },
  { timestamps: true }
);

// 🔹 Encrypt password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🔹 Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
