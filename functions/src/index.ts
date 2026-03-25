import * as functions from "firebase-functions";
import * as nodemailer from "nodemailer";
import * as cors from "cors";
import * as dotenv from "dotenv";
import * as https from "https";

const corsHandler = cors({ origin: true });
dotenv.config();

const SITE_URL = "https://miceday.co.kr";
const SUPABASE_REST_URL = "https://zwxvjlnzhjmsuwjnwvqv.supabase.co/rest/v1";
const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3eHZqbG56aGptc3V3am53dnF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1ODcwNjIsImV4cCI6MjA4NTE2MzA2Mn0.GA0nRGSMr9XxXHc1VhpSeSB2hnaZknO2ojedpsTWrw4";

// 이메일 발송을 위한 Transporter 생성
// Firebase Functions (.env 사용)
const normalizeEnvValue = (value?: string) => {
    if (!value) {
        return "";
    }
    return value.trim().replace(/^['"]|['"]$/g, "");
};

type SitemapProduct = {
    id: string;
    created_at?: string | null;
};

const xmlEscape = (value: string) =>
    value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");

const fetchJson = <T>(url: string, headers: Record<string, string>): Promise<T> =>
    new Promise((resolve, reject) => {
        const request = https.get(url, { headers }, (response) => {
            let rawData = "";

            response.setEncoding("utf8");
            response.on("data", (chunk) => {
                rawData += chunk;
            });

            response.on("end", () => {
                const statusCode = response.statusCode || 500;

                if (statusCode >= 400) {
                    reject(new Error(`Request failed with status ${statusCode}: ${rawData}`));
                    return;
                }

                try {
                    resolve(JSON.parse(rawData) as T);
                } catch (error) {
                    reject(error);
                }
            });
        });

        request.on("error", reject);
    });

const sitemapEntry = (
    loc: string,
    changefreq: string,
    priority: string,
    lastmod?: string | null
) => `  <url>
    <loc>${xmlEscape(loc)}</loc>
${lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : ""}    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;

export const sitemapXml = functions.https.onRequest(async (req, res) => {
    if (req.method !== "GET") {
        res.status(405).send("Method Not Allowed");
        return;
    }

    try {
        const today = new Date().toISOString().slice(0, 10);
        const products = await fetchJson<SitemapProduct[]>(
            `${SUPABASE_REST_URL}/products?select=id,created_at&product_type=eq.basic&order=created_at.desc`,
            {
                apikey: SUPABASE_ANON_KEY,
                Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            }
        );

        const staticEntries = [
            sitemapEntry(`${SITE_URL}/`, "daily", "1.0", today),
            sitemapEntry(`${SITE_URL}/products`, "daily", "0.8", today),
            sitemapEntry(`${SITE_URL}/company`, "monthly", "0.7", today),
            sitemapEntry(`${SITE_URL}/alliance`, "monthly", "0.7", today),
            sitemapEntry(`${SITE_URL}/cs`, "monthly", "0.6", today),
            sitemapEntry(`${SITE_URL}/terms`, "yearly", "0.3", today),
            sitemapEntry(`${SITE_URL}/privacy`, "yearly", "0.3", today),
        ];

        const productEntries = products
            .filter((product) => Boolean(product.id))
            .map((product) =>
                sitemapEntry(
                    `${SITE_URL}/products/${product.id}`,
                    "weekly",
                    "0.7",
                    product.created_at ? new Date(product.created_at).toISOString().slice(0, 10) : null
                )
            );

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticEntries, ...productEntries].join("\n")}
</urlset>
`;

        res.set("Content-Type", "application/xml; charset=utf-8");
        res.set("Cache-Control", "public, max-age=3600, s-maxage=3600");
        res.status(200).send(xml);
    } catch (error) {
        console.error("Failed to generate sitemap.xml", error);
        res.status(500).send("Failed to generate sitemap.xml");
    }
});

export const sendEmailVerification = functions.https.onRequest((req, res) => {
    // CORS 처리
    corsHandler(req, res, async () => {
        // POST 요청만 허용
        if (req.method !== "POST") {
            res.status(405).send("Method Not Allowed");
            return;
        }

        const { to, subject, html } = req.body;

        if (!to || !subject || !html) {
            res.status(400).json({ error: "Missing required fields (to, subject, html)" });
            return;
        }

        // 설정 확인
        const emailUser = normalizeEnvValue(process.env.EMAIL_USER);
        const emailPass = normalizeEnvValue(process.env.EMAIL_PASS);
        const emailFromName = normalizeEnvValue(process.env.EMAIL_FROM_NAME) || "휴먼파트너";

        // 커스텀 SMTP 설정 (옵션)
        const smtpHost = normalizeEnvValue(process.env.SMTP_HOST);
        const smtpPort = parseInt(normalizeEnvValue(process.env.SMTP_PORT) || "587", 10);
        const smtpSecure = normalizeEnvValue(process.env.SMTP_SECURE) === "true";

        if (!emailUser || !emailPass) {
            console.error("Missing SMTP credentials. Check EMAIL_USER/EMAIL_PASS.");
            res.status(500).json({ error: "Missing SMTP credentials" });
            return;
        }

        let transporterConfig: any;

        // SMTP 호스트가 설정되어 있으면 해당 설정 사용, 아니면 Gmail 서비스 사용
        if (smtpHost) {
            transporterConfig = {
                host: smtpHost,
                port: smtpPort,
                secure: smtpSecure, // true for 465, false for other ports
                auth: {
                    user: emailUser,
                    pass: emailPass,
                },
            };
        } else {
            transporterConfig = {
                service: "gmail",
                auth: {
                    user: emailUser,
                    pass: emailPass,
                },
            };
        }

        const transporter = nodemailer.createTransport(transporterConfig);

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
        } catch (error: any) {
            console.error("Error sending email:", error);
            res.status(500).json({ error: "Failed to send email", details: error.message });
        }
    });
});
