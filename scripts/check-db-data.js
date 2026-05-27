import "dotenv/config";
import mongoose from "mongoose";
import Analytics from "../models/Analytics.js";

async function checkDb() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/portfolio");
    console.log("Connected to MongoDB!");

    const analyticsDocs = await Analytics.find({});
    console.log("Analytics Records count:", analyticsDocs.length);
    console.log("Analytics Documents:", JSON.stringify(analyticsDocs, null, 2));

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  } catch (error) {
    console.error("DB check failed:", error);
  }
}

checkDb();
