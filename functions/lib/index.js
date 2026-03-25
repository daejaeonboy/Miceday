"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSiteEmail = void 0;
const functions = require("firebase-functions");
const nodemailer = require("nodemailer");
const cors = require("cors");
const dotenv = require("dotenv");
const corsHandler = cors({ origin: true });
dotenv.config();
const normalizeEnvValue = (value) => {
    if (!value) {
        return "";
    }
    return value.trim().replace(/^['"]|['"]$/g, "");
};
exports.sendSiteEmail = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        if (req.method !== "POST") {
            res.status(405).send("Method Not Allowed");
            return;
        }
        const { to, subject, html } = req.body;
        if (!to || !subject || !html) {
            res.status(400).json({ error: "Missing required fields (to, subject, html)" });
            return;
        }
        const emailUser = normalizeEnvValue(process.env.EMAIL_USER);
        const emailPass = normalizeEnvValue(process.env.EMAIL_PASS);
        const emailFromName = normalizeEnvValue(process.env.EMAIL_FROM_NAME) || "\uD734\uBA3C\uD30C\uD2B8\uB108";
        const smtpHost = normalizeEnvValue(process.env.SMTP_HOST);
        const smtpPort = parseInt(normalizeEnvValue(process.env.SMTP_PORT) || "587", 10);
        const smtpSecure = normalizeEnvValue(process.env.SMTP_SECURE) === "true";
        if (!emailUser || !emailPass) {
            console.error("Missing SMTP credentials. Check EMAIL_USER/EMAIL_PASS.");
            res.status(500).json({ error: "Missing SMTP credentials" });
            return;
        }
        const transporter = nodemailer.createTransport(smtpHost
            ? {
                host: smtpHost,
                port: smtpPort,
                secure: smtpSecure,
                auth: {
                    user: emailUser,
                    pass: emailPass,
                },
            }
            : {
                service: "gmail",
                auth: {
                    user: emailUser,
                    pass: emailPass,
                },
            });
        const mailOptions = {
            from: `"${emailFromName}" <${emailUser}>`,
            to,
            subject,
            html,
        };
        try {
            const info = await transporter.sendMail(mailOptions);
            console.log("Email sent successfully:", info.response);
            res.status(200).json({ message: "Email sent successfully", info });
        }
        catch (error) {
            console.error("Error sending email:", error);
            res.status(500).json({ error: "Failed to send email", details: error.message });
        }
    });
});
//# sourceMappingURL=index.js.map