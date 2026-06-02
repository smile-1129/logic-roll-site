const fs = require("fs");
const path = require("path");

const SCREEN_NAME = "logicroll_info";

async function readManualTweetUrl() {
  try {
    const filePath = path.join(process.cwd(), "data", "x-latest.json");
    const raw = await fs.promises.readFile(filePath, "utf8");
    const data = JSON.parse(raw);
    const url = typeof data.tweetUrl === "string" ? data.tweetUrl.trim() : "";
    return url || null;
  } catch {
    return null;
  }
}

async function findTweetUrlFromProfile() {
  const readerUrl = `https://r.jina.ai/https://x.com/${SCREEN_NAME}`;
  const res = await fetch(readerUrl, {
    headers: { Accept: "text/plain", "User-Agent": "LogicRollSite/1.0" },
  });
  if (!res.ok) return null;

  const text = await res.text();
  const pattern = new RegExp(
    `(?:https?:\\/\\/)?(?:www\\.)?(?:x|twitter)\\.com\\/${SCREEN_NAME}\\/status\\/(\\d+)`,
    "i"
  );
  const match = text.match(pattern);
  if (!match) return null;

  return `https://x.com/${SCREEN_NAME}/status/${match[1]}`;
}

async function fetchOEmbed(tweetUrl) {
  const oembedUrl = new URL("https://publish.twitter.com/oembed");
  oembedUrl.searchParams.set("url", tweetUrl);
  oembedUrl.searchParams.set("omit_script", "true");
  oembedUrl.searchParams.set("lang", "ja");
  oembedUrl.searchParams.set("dnt", "true");
  oembedUrl.searchParams.set("theme", "light");

  const res = await fetch(oembedUrl.toString(), {
    redirect: "follow",
    headers: { "User-Agent": "LogicRollSite/1.0" },
  });

  if (!res.ok) {
    throw new Error(`oEmbed failed: ${res.status}`);
  }

  return res.json();
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "GET") {
    res.status(405).json({ ok: false, error: "method_not_allowed" });
    return;
  }

  try {
    const tweetUrl = (await readManualTweetUrl()) || (await findTweetUrlFromProfile());

    if (!tweetUrl) {
      res.status(200).json({
        ok: false,
        reason: "no_posts",
        profileUrl: `https://x.com/${SCREEN_NAME}`,
      });
      return;
    }

    const oembed = await fetchOEmbed(tweetUrl);

    res.status(200).json({
      ok: true,
      tweetUrl,
      html: oembed.html,
      authorName: oembed.author_name,
      authorUrl: oembed.author_url,
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      reason: "fetch_failed",
      profileUrl: `https://x.com/${SCREEN_NAME}`,
    });
  }
};
