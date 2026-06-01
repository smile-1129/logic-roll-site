/**
 * Vercel Serverless — Web3Forms 経由でメール送信
 * 環境変数 WEB3FORMS_ACCESS_KEY を Vercel に設定してください。
 * https://web3forms.com で無料取得できます。
 */
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

  const accessKey = process.env.WEB3FORMS_ACCESS_KEY;
  if (!accessKey) {
    return res.status(503).json({
      ok: false,
      error:
        "送信設定が未完了です。Vercel の環境変数 WEB3FORMS_ACCESS_KEY を設定してください。",
    });
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

  try {
    const upstream = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: accessKey,
        name,
        email,
        subject: `[LOGIC ROLL] ${subject}`,
        message,
        from_name: "LOGIC ROLL 公式サイト",
      }),
    });

    const data = await upstream.json().catch(() => ({}));

    if (upstream.ok && data.success) {
      return res.status(200).json({
        ok: true,
        message: "送信が完了しました。内容を確認のうえ、ご返信いたします。",
      });
    }

    console.error("Web3Forms error:", data);
    return res.status(502).json({
      ok: false,
      error: data.message || "送信に失敗しました。時間をおいて再度お試しください。",
    });
  } catch (err) {
    console.error("Contact API error:", err);
    return res.status(500).json({
      ok: false,
      error: "送信に失敗しました。時間をおいて再度お試しください。",
    });
  }
}
