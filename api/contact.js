/**
 * Vercel Serverless — お問い合わせを FormSubmit 経由で送信
 * （ブラウザの CORS 制限を回避）
 */
const FORMSUBMIT_EMAIL = "dojinworks.2525@gmail.com";

function sanitize(value, maxLen) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim().replace(/\0/g, "");
  return trimmed.length > maxLen ? trimmed.slice(0, maxLen) : trimmed;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const name = sanitize(req.body?.name, 80);
  const email = sanitize(req.body?.email, 254);
  const subject = sanitize(req.body?.subject, 120);
  const message = sanitize(req.body?.message, 3000);

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ ok: false, error: "必須項目を入力してください。" });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ ok: false, error: "メールアドレスの形式が正しくありません。" });
  }

  const body = new URLSearchParams({
    name,
    email,
    subject,
    message,
    _subject: `[LOGIC ROLL] ${subject}`,
    _template: "table",
    _captcha: "false",
  });

  try {
    const upstream = await fetch(
      `https://formsubmit.co/${encodeURIComponent(FORMSUBMIT_EMAIL)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      }
    );

    if (!upstream.ok) {
      const text = await upstream.text().catch(() => "");
      console.error("FormSubmit error:", upstream.status, text.slice(0, 200));
      return res.status(502).json({
        ok: false,
        error: "送信サービスへの接続に失敗しました。時間をおいて再度お試しください。",
      });
    }

    return res.status(200).json({
      ok: true,
      message: "送信が完了しました。内容を確認のうえ、ご返信いたします。",
    });
  } catch (err) {
    console.error("Contact API error:", err);
    return res.status(500).json({
      ok: false,
      error: "送信に失敗しました。時間をおいて再度お試しください。",
    });
  }
}
