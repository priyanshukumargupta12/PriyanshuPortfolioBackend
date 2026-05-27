import Contact from "../models/Contact.js";
import nodemailer from "nodemailer";

// ─── Create transporter ───────────────────────────────────────────────────────
const createTransporter = () => {
  if (!process.env.SMTP_USER) return null;

  // Use service: 'gmail' when using gmail SMTP to bypass custom host/port issues
  if (process.env.SMTP_HOST === "smtp.gmail.com") {
    return nodemailer.createTransport({
      service: "gmail",
      debug: true,
      logger: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    debug: true,
    logger: true,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
};

// ─── Email Templates ─────────────────────────────────────────────────────────
const adminEmailHtml = (name, email, message) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Inquiry</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      color: #334155;
      margin: 0;
      padding: 0;
    }
    .wrapper {
      width: 100%;
      background-color: #f8fafc;
      padding: 40px 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      padding: 32px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 24px;
      font-weight: 700;
    }
    .content {
      padding: 32px;
    }
    .section-title {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
      margin-bottom: 12px;
      font-weight: 700;
      border-bottom: 2px solid #f1f5f9;
      padding-bottom: 6px;
    }
    .field-group {
      margin-bottom: 20px;
    }
    .field-label {
      font-size: 13px;
      font-weight: 600;
      color: #475569;
      margin-bottom: 6px;
    }
    .field-value {
      font-size: 15px;
      color: #0f172a;
      background-color: #f8fafc;
      padding: 12px 16px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      line-height: 1.5;
    }
    .message-box {
      border-left: 4px solid #6366f1;
      background-color: #eef2ff;
    }
    .btn-container {
      text-align: center;
      margin-top: 32px;
    }
    .btn {
      display: inline-block;
      background-color: #6366f1;
      color: #ffffff !important;
      padding: 12px 24px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 15px;
      box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.3);
    }
    .footer {
      background-color: #f8fafc;
      padding: 24px;
      text-align: center;
      font-size: 13px;
      color: #94a3b8;
      border-top: 1px solid #e2e8f0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>📬 New Inquiry Received</h1>
      </div>
      <div class="content">
        <div class="section-title">Sender Info</div>
        
        <div class="field-group">
          <div class="field-label">Name</div>
          <div class="field-value">${name}</div>
        </div>
        
        <div class="field-group">
          <div class="field-label">Email</div>
          <div class="field-value"><a href="mailto:${email}" style="color: #6366f1; text-decoration: none;">${email}</a></div>
        </div>
        
        <div class="section-title">Message</div>
        
        <div class="field-group">
          <div class="field-value message-box">${message.replace(/\n/g, "<br>")}</div>
        </div>

        <div class="btn-container">
          <a href="mailto:${email}" class="btn">Reply Directly</a>
        </div>
      </div>
      <div class="footer">
        Submitted at ${new Date().toLocaleString()}
      </div>
    </div>
  </div>
</body>
</html>
`;

const userEmailHtml = (name, message) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      color: #334155;
      margin: 0;
      padding: 0;
    }
    .wrapper {
      width: 100%;
      background-color: #f8fafc;
      padding: 40px 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      padding: 32px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 24px;
      font-weight: 700;
    }
    .content {
      padding: 32px;
      line-height: 1.6;
    }
    .welcome {
      font-size: 16px;
      font-weight: 600;
      color: #0f172a;
      margin-top: 0;
    }
    .copy-title {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
      margin-bottom: 12px;
      font-weight: 700;
      border-bottom: 2px solid #f1f5f9;
      padding-bottom: 6px;
      margin-top: 24px;
    }
    .copy-box {
      font-size: 15px;
      color: #475569;
      background-color: #f8fafc;
      padding: 16px;
      border-radius: 8px;
      border-left: 4px solid #10b981;
      font-style: italic;
    }
    .signature {
      margin-top: 32px;
      border-top: 1px solid #f1f5f9;
      padding-top: 20px;
    }
    .footer {
      background-color: #f8fafc;
      padding: 24px;
      text-align: center;
      font-size: 13px;
      color: #94a3b8;
      border-top: 1px solid #e2e8f0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>✨ Message Received!</h1>
      </div>
      <div class="content">
        <p class="welcome">Hi ${name},</p>
        <p>Thanks for getting in touch! I have successfully received your message and will read it shortly. I'll get back to you as soon as possible, usually within 24 hours.</p>
        
        <div class="copy-title">Here is a copy of your message:</div>
        <div class="copy-box">${message.replace(/\n/g, "<br>")}</div>
        
        <div class="signature">
          <strong>Priyanshu Kumar</strong><br>
          <span style="font-size: 13px; color: #64748b;">Full Stack Developer</span>
        </div>
      </div>
      <div class="footer">
        Automated confirmation from Priyanshu Kumar's Portfolio
      </div>
    </div>
  </div>
</body>
</html>
`;

// ─── POST /api/contact ────────────────────────────────────────────────────────
export const submitContact = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress || "";

    // Save to DB
    const contact = await Contact.create({ name, email, message, ipAddress });

    // Send emails
    const transporter = createTransporter();
    if (transporter) {
      // 1. Send notification to admin
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: process.env.EMAIL_TO,
          replyTo: email,
          subject: `📬 New Portfolio Inquiry from ${name}`,
          html: adminEmailHtml(name, email, message),
        });
      } catch (emailError) {
        console.warn("Admin email notification failed:", emailError.message);
      }

      // 2. Send confirmation to user
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: email,
          subject: `✨ Message Received - Priyanshu Kumar`,
          html: userEmailHtml(name, message),
        });
      } catch (emailError) {
        console.warn("User email confirmation failed:", emailError.message);
      }
    }

    res.status(201).json({
      success: true,
      message: "Message sent successfully! I'll get back to you soon.",
      data: { id: contact._id },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/contact  (Admin only) ──────────────────────────────────────────
export const getAllContacts = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [contacts, total] = await Promise.all([
      Contact.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Contact.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: contacts,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /api/contact/:id/status  (Admin only) ─────────────────────────────
export const updateContactStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!contact) {
      return res.status(404).json({ success: false, message: "Contact not found" });
    }
    res.json({ success: true, message: "Status updated", data: contact });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/contact/:id  (Admin only) ───────────────────────────────────
export const deleteContact = async (req, res, next) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: "Contact not found" });
    }
    res.json({ success: true, message: "Contact deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/contact/stats  (Admin only) ────────────────────────────────────
export const getContactStats = async (req, res, next) => {
  try {
    const stats = await Contact.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const total = await Contact.countDocuments();
    const unreadCount = stats.find((s) => s._id === "unread")?.count || 0;
    res.json({ success: true, data: { total, new: unreadCount, byStatus: stats } });
  } catch (error) {
    next(error);
  }
};
