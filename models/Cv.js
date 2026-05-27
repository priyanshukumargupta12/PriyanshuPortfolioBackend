import mongoose from "mongoose";

const cvSchema = new mongoose.Schema(
  {
    pdfData: {
      type: String,
      required: [true, "PDF data is required"], // Base64 Data URL or string
    },
    filename: {
      type: String,
      default: "resume.pdf",
    },
  },
  {
    timestamps: true,
  }
);

const Cv = mongoose.model("Cv", cvSchema);
export default Cv;
