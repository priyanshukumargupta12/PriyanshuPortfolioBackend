import mongoose from "mongoose";

const pathHitSchema = new mongoose.Schema({
  path: { type: String, required: true },
  hits: { type: Number, default: 0 }
}, { _id: false });

const analyticsSchema = new mongoose.Schema(
  {
    date: {
      type: String, // format YYYY-MM-DD
      required: true,
      unique: true,
    },
    pageviews: {
      type: Number,
      default: 0,
    },
    uniqueVisitors: {
      type: Number,
      default: 0,
    },
    downloads: {
      type: Number,
      default: 0,
    },
    devices: {
      mobile: { type: Number, default: 0 },
      desktop: { type: Number, default: 0 },
      tablet: { type: Number, default: 0 },
    },
    pages: [pathHitSchema],
    visitorIds: [{
      type: String, // session / localStorage client IDs to track daily uniqueness
    }],
  },
  {
    timestamps: true,
  }
);

const Analytics = mongoose.model("Analytics", analyticsSchema);
export default Analytics;
