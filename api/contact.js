import crypto from "node:crypto";

export const maxDuration = 15;

const RESEND_API_URL = "https://api.resend.com/emails";
const REQUEST_TIMEOUT_MS = 10000;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const rateLimits = new Map();

const limits = {
    name: { min: 1, max: 100 },
    email: { max: 254 },
    subject: { min: 1, max: 150 },
    message: { min: 10, max: 5000 }
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const hasHeaderInjection = (value) => /[\r\n]/.test(value);
const clean = (value) => typeof value === "string" ? value.trim() : "";
const escapeHtml = (value) => value.replace(/[&<>'"]/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
})[character]);

const validate = (body) => {
    const values = {
        name: clean(body?.name),
        email: clean(body?.email).toLowerCase(),
        subject: clean(body?.subject),
        message: clean(body?.message)
    };
    const errors = {};

    if (values.name.length < limits.name.min) errors.name = "Name is required.";
    else if (values.name.length > limits.name.max) errors.name = "Name is too long.";
    else if (hasHeaderInjection(values.name)) errors.name = "Enter a valid name.";

    if (!values.email) errors.email = "Email is required.";
    else if (values.email.length > limits.email.max || !emailPattern.test(values.email) || hasHeaderInjection(values.email)) {
        errors.email = "Enter a valid email address.";
    }

    if (values.subject.length < limits.subject.min) errors.subject = "Subject is required.";
    else if (values.subject.length > limits.subject.max) errors.subject = "Subject is too long.";
    else if (hasHeaderInjection(values.subject)) errors.subject = "Enter a valid subject.";

    if (!values.message) errors.message = "Message is required.";
    else if (values.message.length < limits.message.min) errors.message = `Message must be at least ${limits.message.min} characters.`;
    else if (values.message.length > limits.message.max) errors.message = "Message is too long.";

    return { values, errors };
};

const getClientAddress = (request) => {
    const forwarded = request.headers["x-forwarded-for"];
    return (Array.isArray(forwarded) ? forwarded[0] : forwarded || request.socket?.remoteAddress || "unknown")
        .split(",")[0]
        .trim();
};

const isRateLimited = (address) => {
    const now = Date.now();
    const recent = (rateLimits.get(address) || []).filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW_MS);
    recent.push(now);
    rateLimits.set(address, recent);

    if (rateLimits.size > 500) {
        for (const [key, timestamps] of rateLimits) {
            if (!timestamps.some(timestamp => now - timestamp < RATE_LIMIT_WINDOW_MS)) rateLimits.delete(key);
        }
    }

    return recent.length > RATE_LIMIT_MAX_REQUESTS;
};

const isSameOrigin = (request) => {
    const origin = request.headers.origin;
    if (!origin) return true;
    const host = request.headers["x-forwarded-host"] || request.headers.host;
    try {
        return new URL(origin).host === host;
    } catch {
        return false;
    }
};

export default async function handler(request, response) {
    response.setHeader("Cache-Control", "no-store");
    if (request.method !== "POST") {
        response.setHeader("Allow", "POST");
        return response.status(405).json({ error: "Method not allowed." });
    }

    if (!isSameOrigin(request)) return response.status(403).json({ error: "Request rejected." });
    if (isRateLimited(getClientAddress(request))) {
        return response.status(429).json({ error: "Too many requests. Please try again later." });
    }

    const body = request.body || {};
    if (clean(body.website)) return response.status(200).json({ ok: true });

    const { values, errors } = validate(body);
    if (Object.keys(errors).length) return response.status(400).json({ error: "Invalid form data.", fields: errors });

    const submissionId = clean(body.submissionId);
    if (!/^[a-f0-9-]{36}$/i.test(submissionId)) {
        return response.status(400).json({ error: "Invalid submission." });
    }

    const { RESEND_API_KEY, CONTACT_EMAIL, CONTACT_FROM_EMAIL } = process.env;
    if (!RESEND_API_KEY || !CONTACT_EMAIL || !CONTACT_FROM_EMAIL) {
        console.error("Contact form environment variables are incomplete");
        return response.status(503).json({ error: "Contact service is temporarily unavailable." });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const text = [
        "New Portfolio Contact", "", `Name: ${values.name}`, `Email: ${values.email}`,
        `Subject: ${values.subject}`, "", "Message:", values.message, "", "Sent from: My Portfolio Contact Form"
    ].join("\n");
    const html = `<h2>New Portfolio Contact</h2>
        <p><strong>Name:</strong> ${escapeHtml(values.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(values.email)}</p>
        <p><strong>Subject:</strong> ${escapeHtml(values.subject)}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(values.message).replace(/\n/g, "<br>")}</p>
        <p><small>Sent from: My Portfolio Contact Form</small></p>`;

    try {
        const resendResponse = await fetch(RESEND_API_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${RESEND_API_KEY}`,
                "Content-Type": "application/json",
                "Idempotency-Key": `portfolio-contact/${submissionId}`
            },
            body: JSON.stringify({
                from: CONTACT_FROM_EMAIL,
                to: [CONTACT_EMAIL],
                reply_to: values.email,
                subject: `Portfolio Contact — ${values.subject}`,
                text,
                html
            }),
            signal: controller.signal
        });
        const result = await resendResponse.json().catch(() => ({}));
        if (!resendResponse.ok || !result.id) {
            console.error("Resend contact delivery failed", { status: resendResponse.status, name: result?.name });
            return response.status(502).json({ error: "Email delivery failed." });
        }
        return response.status(200).json({ ok: true });
    } catch (error) {
        console.error("Contact form request failed", {
            type: error?.name,
            message: error instanceof Error ? error.message : "Unknown error"
        });
        return response.status(error?.name === "AbortError" ? 504 : 500).json({ error: "Email delivery failed." });
    } finally {
        clearTimeout(timeout);
    }
}
