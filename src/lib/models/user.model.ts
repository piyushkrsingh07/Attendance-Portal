import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    studentNo: {
      type: String,
      required: true,
      unique: true,
    },
    Name: {
      type: String,
       required: true,
    },
    password: {
      type: String,
      required: true,
    },
     projects: [
            {
              title: { type: String ,unique:true},
              link: { type: String }, 
              submissionDate: { type: Date, default: Date.now }
            }
          ],
    role: {
      type: String,
      enum: ["admin", "user"],
      required: true,
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    profileImage: { type: String }
  },
  { timestamps: true }
);

  export const User = mongoose.models?.User || mongoose.model("User", UserSchema);