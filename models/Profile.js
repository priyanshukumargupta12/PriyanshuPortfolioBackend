import mongoose from "mongoose";

const educationSchema = new mongoose.Schema({
  degree: { type: String, required: true },
  field: { type: String, required: true },
  institution: { type: String, required: true },
  year: { type: String, required: true },
  grade: { type: String },
  description: { type: String }
});

const experienceSchema = new mongoose.Schema({
  role: { type: String, required: true },
  company: { type: String, required: true },
  period: { type: String, required: true },
  description: { type: String },
  tags: [{ type: String }]
});

const profileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    profileImage: {
      type: String,
      default: "",
    },
    roles: [{
      type: String,
    }],
    bio: {
      type: String,
      required: [true, "Bio is required"],
    },
    longBio: {
      type: String,
      required: [true, "Long bio is required"],
    },
    location: {
      type: String,
      default: "India",
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    phone: {
      type: String,
      trim: true,
    },
    availability: {
      type: String,
      default: "Open to opportunities",
    },
    socials: {
      github: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      twitter: { type: String, default: "" },
      instagram: { type: String, default: "" },
    },
    stats: {
      projectsBuilt: { type: Number, default: 20 },
      yearsExperience: { type: Number, default: 2 },
      technologies: { type: Number, default: 15 },
      githubRepos: { type: Number, default: 30 },
    },
    education: [educationSchema],
    experience: [experienceSchema],
  },
  {
    timestamps: true,
  }
);

const Profile = mongoose.model("Profile", profileSchema);
export default Profile;
