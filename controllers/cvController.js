import Cv from "../models/Cv.js";
import cloudinary from "../config/cloudinary.js";
import http from "http";
import https from "https";
import Analytics from "../models/Analytics.js";

// ─── GET /api/cv/download  (Public) ───────────────────────────────────────────
export const downloadCv = async (req, res, next) => {
  try {
    const date = new Date();
    const localDate = new Date(date.getTime() + (330 * 60 * 1000));
    const dateString = localDate.toISOString().slice(0, 10);
    
    Analytics.findOneAndUpdate(
      { date: dateString },
      { $inc: { downloads: 1 } },
      { upsert: true }
    ).catch(err => console.error("Failed to log CV download in analytics:", err));

    const cv = await Cv.findOne();
    if (!cv || !cv.pdfData) {
      return res.status(404).send("<h2>No resume/CV uploaded yet. Please contact the administrator.</h2>");
    }

    // If the PDF is stored as a Cloudinary web URL, stream it to avoid 401 permission errors
    if (cv.pdfData.startsWith("http")) {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${cv.filename || "resume.pdf"}"`);

      const client = cv.pdfData.startsWith("https") ? https : http;
      client.get(cv.pdfData, (cloudinaryResponse) => {
        if (cloudinaryResponse.statusCode !== 200) {
          return res.status(cloudinaryResponse.statusCode).send("<h2>Failed to download resume from storage.</h2>");
        }
        cloudinaryResponse.pipe(res);
      }).on("error", (err) => {
        next(err);
      });
      return;
    }

    // Extract raw base64 string (legacy fallback)
    let base64Data = cv.pdfData;
    if (base64Data.includes(";base64,")) {
      base64Data = base64Data.split(";base64,")[1];
    }

    const pdfBuffer = Buffer.from(base64Data, "base64");

    // Stream PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${cv.filename || "resume.pdf"}"`);
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/cv/status  (Admin & Public) ─────────────────────────────────────
export const getCvInfo = async (req, res, next) => {
  try {
    const cv = await Cv.findOne().select("-pdfData"); // Exclude heavy file content
    if (!cv) {
      return res.json({ success: true, exists: false, data: null });
    }
    res.json({
      success: true,
      exists: true,
      data: {
        id: cv._id,
        filename: cv.filename,
        updatedAt: cv.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/cv  (Admin only) ────────────────────────────────────────────────
export const uploadCv = async (req, res, next) => {
  try {
    let { pdfData, filename } = req.body;
    if (!pdfData) {
      return res.status(400).json({ success: false, message: "PDF data is required" });
    }

    // Upload base64 PDF data to Cloudinary as 'raw' resource type
    if (pdfData.startsWith("data:")) {
      const uploadRes = await cloudinary.uploader.upload(pdfData, {
        folder: "portfolio/cv",
        resource_type: "raw",
        public_id: "resume",
      });
      pdfData = uploadRes.secure_url;
    }

    // Remove old CV if it exists, keeping only one CV active
    await Cv.deleteMany();

    const cv = await Cv.create({ pdfData, filename: filename || "resume.pdf" });

    res.status(201).json({
      success: true,
      message: "CV uploaded successfully",
      data: {
        id: cv._id,
        filename: cv.filename,
        updatedAt: cv.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/cv  (Admin only) ──────────────────────────────────────────────
export const deleteCv = async (req, res, next) => {
  try {
    await Cv.deleteMany();
    res.json({
      success: true,
      message: "CV deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
