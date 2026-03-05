import express from "express";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for sending emails
  app.post("/api/send-email", async (req, res) => {
    const { smtpConfig, emailData } = req.body;

    if (!smtpConfig || !emailData || !emailData.to) {
      return res.status(400).json({ error: "Missing configuration or email data" });
    }

    const recipients = Array.isArray(emailData.to) ? emailData.to : [emailData.to];
    
    if (recipients.length > 1000) {
      return res.status(400).json({ error: "Maximum limit of 1000 recipients exceeded" });
    }

    try {
      const transporter = nodemailer.createTransport({
        host: smtpConfig.host,
        port: parseInt(smtpConfig.port),
        secure: smtpConfig.secure, // Use the explicit toggle from the UI
        auth: {
          user: smtpConfig.user,
          pass: smtpConfig.pass,
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      const results = {
        success: 0,
        failed: 0,
        errors: [] as string[]
      };

      // Send emails sequentially to avoid overwhelming the SMTP server and improve deliverability
      for (const recipient of recipients) {
        try {
          await transporter.sendMail({
            from: `"${smtpConfig.fromName || 'Email Sender'}" <${smtpConfig.user}>`,
            to: recipient.trim(),
            subject: emailData.subject,
            text: emailData.text,
            html: emailData.html || emailData.text.replace(/\n/g, '<br>'),
          });
          results.success++;
        } catch (err: any) {
          results.failed++;
          results.errors.push(`${recipient}: ${err.message}`);
        }
      }

      res.json({ 
        success: true, 
        summary: results 
      });
    } catch (error: any) {
      console.error("SMTP Connection Error:", error);
      res.status(500).json({ error: error.message || "Failed to connect to SMTP server" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
