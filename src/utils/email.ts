import type { QuoteInquiryPayload } from "../api/inquiryApi";

const ACTIVE_SITE_EMAIL_API_URL =
    "https://us-central1-human-partner.cloudfunctions.net/sendEmailVerification";
const LEGACY_SITE_EMAIL_API_URL =
    "https://us-central1-human-partner.cloudfunctions.net/sendSiteEmail";
const CURRENT_PROJECT_SITE_EMAIL_API_URL =
    "https://us-central1-humanpartner-77b4c.cloudfunctions.net/sendSiteEmail";
const configuredSiteEmailApiUrl = (import.meta.env.VITE_SITE_EMAIL_API_URL || "").trim();
const QUOTE_REQUEST_RECEIVER_EMAIL = "hm_solution@naver.com";

export const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendVerificationEmail = async (toName: string, toEmail: string, code: string) => {
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #FF5B60; margin: 0;">마이스파트너</h1>
                <p style="color: #666; font-size: 14px;">장소, 장비</p>
            </div>
            <div style="background-color: #f9f9f9; padding: 30px; border-radius: 8px; text-align: center;">
                <h2 style="color: #333; margin-top: 0;">이메일 인증 안내</h2>
                <p style="color: #555; line-height: 1.5;">
                    안녕하세요, ${toName}님.<br/>
                    행사어때 회원가입을 환영합니다.<br/>
                    아래 인증번호를 회원가입 화면에 입력해 주세요.
                </p>
                <div style="margin: 30px 0;">
                    <span style="display: inline-block; background-color: #fff; padding: 15px 30px; font-size: 24px; font-weight: bold; color: #FF5B60; border: 2px solid #FF5B60; border-radius: 5px; letter-spacing: 5px;">
                        ${code}
                    </span>
                </div>
                <p style="color: #888; font-size: 12px;">
                    본 메일은 발신 전용이며 회신되지 않습니다.<br/>
                    인증번호는 10분간 유효합니다.
                </p>
            </div>
            <div style="text-align: center; margin-top: 20px; color: #aaa; font-size: 12px;">
                &copy; 2026 Hangsaeottae. All rights reserved.
            </div>
        </div>
    `;

    try {
        const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
        const apiUrl = isLocalhost ? ACTIVE_SITE_EMAIL_API_URL : "/api/email/verify";

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                to: toEmail,
                subject: "[행사어때] 회원가입 이메일 인증번호",
                html: htmlContent,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.error || "이메일 발송 실패");
        }

        return response.json();
    } catch (error) {
        console.error("Email send failed:", error);
        throw error;
    }
};

const getSiteEmailApiUrls = () => {
    const candidates = [
        configuredSiteEmailApiUrl,
        "/api/email/send",
        "/api/email/verify",
        ACTIVE_SITE_EMAIL_API_URL,
        LEGACY_SITE_EMAIL_API_URL,
        CURRENT_PROJECT_SITE_EMAIL_API_URL,
    ].filter(Boolean);

    return [...new Set(candidates)];
};

const sendSiteEmailRequest = async (params: {
    to: string;
    subject: string;
    html: string;
}) => {
    let lastError: unknown = null;

    for (const url of getSiteEmailApiUrls()) {
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(params),
            });

            const contentType = response.headers.get("content-type") || "";
            if (contentType.includes("text/html")) {
                throw new Error(`Email endpoint returned HTML instead of API JSON: ${url}`);
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.error || `Email send failed via ${url}`);
            }

            return response.json();
        } catch (error) {
            lastError = error;
            console.error(`Email endpoint failed: ${url}`, error);
        }
    }

    throw lastError instanceof Error ? lastError : new Error("All email endpoints failed");
};

const escapeHtml = (value: string) =>
    value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

const formatPreferredInstallPickupTime = (
    value?: string,
    installTime?: string,
    pickupTime?: string,
) => {
    const directInstall = (installTime || "").trim();
    const directPickup = (pickupTime || "").trim();
    if (directInstall || directPickup) {
        return `설치: ${directInstall || "-"}\n회수: ${directPickup || "-"}`;
    }

    const raw = (value || "").trim();
    if (!raw) return "-";

    const normalized = raw
        .replace(/\r\n/g, "\n")
        .replace(/\s*\/\s*/g, "\n")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

    const installLine = normalized.find((line) => /^설치\s*:?\s*/.test(line));
    const pickupLine = normalized.find((line) => /^회수\s*:?\s*/.test(line));

    const install = installLine
        ? installLine.replace(/^설치\s*:?\s*/, "").trim() || "-"
        : normalized[0] || "-";
    const pickup = pickupLine
        ? pickupLine.replace(/^회수\s*:?\s*/, "").trim() || "-"
        : normalized[1] || "-";

    return `설치: ${install}\n회수: ${pickup}`;
};

const buildInfoRow = (label: string, value: string, isLast = false) => `
    <tr>
        <td style="width: 180px; padding: 14px 16px; background: #f8fafc; ${isLast ? "" : "border-bottom: 1px solid #e2e8f0;"} color: #334155; font-size: 13px; font-weight: 700; vertical-align: top;">
            ${escapeHtml(label)}
        </td>
        <td style="padding: 14px 16px; ${isLast ? "" : "border-bottom: 1px solid #e2e8f0;"} color: #0f172a; font-size: 14px; line-height: 1.7; vertical-align: top;">
            ${value}
        </td>
    </tr>
`;

const buildQuoteInquiryEmailHtml = (
    payload: QuoteInquiryPayload,
    requester?: {
        userId?: string;
        userName?: string;
        userEmail?: string;
    },
    introText?: string,
) => {
    const companyName = escapeHtml(payload.companyName || "-");
    const contactName = escapeHtml(payload.contactName || "-");
    const phone = escapeHtml(payload.phone || "-");
    const email = escapeHtml(payload.email || "-");
    const rentalPeriod = escapeHtml(
        payload.rentalStart && payload.rentalEnd
            ? `${payload.rentalStart} ~ ${payload.rentalEnd}`
            : payload.rentalStart || payload.rentalEnd || "-",
    );
    const budget = escapeHtml(payload.budget || "-");
    const location = escapeHtml(payload.location || "-");
    const preferredInstallPickupTime = escapeHtml(
        formatPreferredInstallPickupTime(
            payload.preferredInstallPickupTime,
            payload.preferredInstallTime,
            payload.preferredPickupTime,
        ),
    ).replace(/\n/g, "<br/>");
    const paymentMethod = escapeHtml(payload.paymentMethod || "-");
    const notes = escapeHtml(payload.notes || "-").replace(/\n/g, "<br/>");
    const productList =
        payload.neededProducts.length > 0
            ? `<ul style="margin: 0; padding-left: 18px; color: #0f172a;">${payload.neededProducts
                  .map((item) => `<li style="margin: 0 0 6px;">${escapeHtml(item)}</li>`)
                  .join("")}</ul>`
            : '<span style="color: #64748b;">선택된 항목이 없습니다.</span>';

    const inquiryRows = [
        buildInfoRow("연락처", phone),
        buildInfoRow("이메일", email),
        buildInfoRow("필요 품목", productList),
        buildInfoRow("렌탈 기간", rentalPeriod),
        buildInfoRow("설치 / 회수 장소", location),
        buildInfoRow("설치 / 회수 희망 시간", preferredInstallPickupTime),
        buildInfoRow("결제방법", paymentMethod),
        buildInfoRow("예산 범위", budget),
        buildInfoRow(
            "요청 내용",
            `<div style="white-space: pre-wrap; padding: 14px 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; color: #0f172a;">${notes}</div>`,
            true,
        ),
    ].join("");

    return `
        <div style="margin: 0; padding: 24px 12px; background: #f1f5f9;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 760px; margin: 0 auto; background: #ffffff; border: 1px solid #dbe3ee; border-radius: 18px; overflow: hidden; font-family: Arial, 'Malgun Gothic', sans-serif; color: #0f172a;">
                <tr>
                    <td style="padding: 28px 28px 20px; background: linear-gradient(135deg, #001e45 0%, #163d7a 100%);">
                        <div style="font-size: 12px; font-weight: 700; letter-spacing: 0.12em; color: #bfdbfe;">QUOTE REQUEST</div>
                        <div style="margin-top: 10px; font-size: 28px; line-height: 1.3; font-weight: 700; color: #ffffff;">휴먼파트너 견적문의 접수</div>
                        <div style="margin-top: 10px; font-size: 14px; line-height: 1.7; color: #dbeafe;">
                            ${escapeHtml(introText || "새 견적문의가 접수되었습니다.")}
                        </div>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 20px 28px 0;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                                <td style="padding: 0 10px 10px 0;" width="50%">
                                    <div style="padding: 14px 16px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px;">
                                        <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.08em; color: #1d4ed8;">업체명</div>
                                        <div style="margin-top: 6px; font-size: 18px; font-weight: 700; color: #0f172a;">${companyName}</div>
                                    </div>
                                </td>
                                <td style="padding: 0 0 10px 10px;" width="50%">
                                    <div style="padding: 14px 16px; background: #f8fafc; border: 1px solid #dbe3ee; border-radius: 12px;">
                                        <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.08em; color: #475569;">담당자명</div>
                                        <div style="margin-top: 6px; font-size: 18px; font-weight: 700; color: #0f172a;">${contactName}</div>
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 20px 28px 0;">
                        <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">문의 정보</div>
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; border-collapse: separate; border-spacing: 0;">
                            ${inquiryRows}
                        </table>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 24px 28px 28px; font-size: 12px; line-height: 1.6; color: #94a3b8; text-align: right;">
                        휴먼파트너 견적문의 자동 알림 메일
                    </td>
                </tr>
            </table>
        </div>
    `;
};

const sendQuoteInquiryEmail = async (
    payload: QuoteInquiryPayload,
    requester?: {
        userId?: string;
        userName?: string;
        userEmail?: string;
    },
    introText?: string,
) => {
    return sendSiteEmailRequest({
        to: QUOTE_REQUEST_RECEIVER_EMAIL,
        subject: `[휴먼파트너 견적문의] ${payload.companyName} / ${payload.contactName}`,
        html: buildQuoteInquiryEmailHtml(payload, requester, introText),
    });
};

export const sendQuoteInquiryNotificationEmail = async (
    payload: QuoteInquiryPayload,
    requester?: {
        userId?: string;
        userName?: string;
        userEmail?: string;
    },
) => {
    return sendQuoteInquiryEmail(payload, requester, "새 견적문의가 접수되었습니다.");
};

export const sendQuoteInquiryFallbackEmail = async (
    payload: QuoteInquiryPayload,
    requester?: {
        userId?: string;
        userName?: string;
        userEmail?: string;
    },
) => {
    return sendQuoteInquiryEmail(
        payload,
        requester,
        "온라인 문의 저장이 어려워 메일 경로로 대신 접수되었습니다.",
    );
};
