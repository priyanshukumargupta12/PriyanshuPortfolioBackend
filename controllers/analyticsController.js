import Analytics from "../models/Analytics.js";

// Helper to get date string YYYY-MM-DD in local/IST timezone
const getDateString = () => {
  const date = new Date();
  // Adjust for India Standard Time (IST) offset +05:30
  const localDate = new Date(date.getTime() + (330 * 60 * 1000));
  return localDate.toISOString().slice(0, 10);
};

// Helper to parse device & browser from User-Agent
const parseUserAgent = (uaString) => {
  const ua = uaString || "";
  let device = "desktop";
  
  if (/mobile|android|iphone|ipad|phone/i.test(ua)) {
    device = /ipad|tablet/i.test(ua) ? "tablet" : "mobile";
  } else if (/tablet/i.test(ua)) {
    device = "tablet";
  }

  let browser = "Other";
  if (/chrome|crios/i.test(ua) && !/edge|opr\//i.test(ua)) browser = "Chrome";
  else if (/safari/i.test(ua) && !/chrome|crios|android/i.test(ua)) browser = "Safari";
  else if (/firefox|iceweasel/i.test(ua)) browser = "Firefox";
  else if (/edge|edg/i.test(ua)) browser = "Edge";
  else if (/opr\/|opera/i.test(ua)) browser = "Opera";

  return { device, browser };
};

// ─── POST /api/analytics/track  (Public) ──────────────────────────────────────────
export const trackEvent = async (req, res, next) => {
  try {
    const { path, type = "pageview", visitorId } = req.body;
    if (!visitorId) {
      return res.status(400).json({ success: false, message: "visitorId is required" });
    }

    const date = getDateString();
    const ua = req.headers["user-agent"];
    const { device } = parseUserAgent(ua);

    if (type === "pageview") {
      // Check if visitor has already hit today
      const existingToday = await Analytics.findOne({ date, visitorIds: visitorId });
      const isUnique = !existingToday;

      const update = {
        $inc: { pageviews: 1 },
        $addToSet: { visitorIds: visitorId }
      };

      if (isUnique) {
        update.$inc.uniqueVisitors = 1;
      }

      // Increment device count
      update.$inc[`devices.${device}`] = 1;

      // Upsert daily document
      const doc = await Analytics.findOneAndUpdate({ date }, update, { upsert: true, new: true });

      // Increment path count in pages array
      const cleanedPath = path || "/";
      const pathExists = doc.pages.some(p => p.path === cleanedPath);
      
      if (pathExists) {
        await Analytics.updateOne(
          { date, "pages.path": cleanedPath },
          { $inc: { "pages.$.hits": 1 } }
        );
      } else {
        await Analytics.updateOne(
          { date },
          { $push: { pages: { path: cleanedPath, hits: 1 } } }
        );
      }

    } else if (type === "download") {
      // Increment resume downloads counter
      await Analytics.findOneAndUpdate(
        { date },
        { $inc: { downloads: 1 } },
        { upsert: true, new: true }
      );
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/analytics/summary  (Admin only) ────────────────────────────────────
export const getAnalyticsSummary = async (req, res, next) => {
  try {
    // Get last 30 days of analytics
    const rawData = await Analytics.find()
      .sort({ date: -1 })
      .limit(30);
    
    // Reverse to chronological order (past to present) for charting
    const last30Days = [...rawData].reverse();

    // Sum overall statistics
    let totalPageviews = 0;
    let totalUniqueVisitors = 0;
    let totalDownloads = 0;
    const devices = { mobile: 0, desktop: 0, tablet: 0 };
    const pageHitsMap = {};

    last30Days.forEach(day => {
      totalPageviews += day.pageviews;
      totalUniqueVisitors += day.uniqueVisitors;
      totalDownloads += day.downloads;
      
      devices.mobile += day.devices.mobile || 0;
      devices.desktop += day.devices.desktop || 0;
      devices.tablet += day.devices.tablet || 0;

      day.pages.forEach(p => {
        pageHitsMap[p.path] = (pageHitsMap[p.path] || 0) + p.hits;
      });
    });

    // Map top pages list sorted by views descending
    const topPages = Object.keys(pageHitsMap)
      .map(path => ({ path, hits: pageHitsMap[path] }))
      .sort((a, b) => b.hits - a.hits)
      .slice(0, 10);

    // Format daily timeline data
    const dailyData = last30Days.map(day => ({
      date: day.date,
      pageviews: day.pageviews,
      uniqueVisitors: day.uniqueVisitors,
      downloads: day.downloads
    }));

    res.json({
      success: true,
      data: {
        totals: {
          pageviews: totalPageviews,
          uniqueVisitors: totalUniqueVisitors,
          downloads: totalDownloads
        },
        devices,
        topPages,
        daily: dailyData
      }
    });
  } catch (error) {
    next(error);
  }
};
