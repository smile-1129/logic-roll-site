(function () {
  const form = document.getElementById("contact-form");
  const statusEl = document.getElementById("contact-status");
  const submitBtn = document.getElementById("contact-submit");
  if (!form || !statusEl || !submitBtn) return;

  const PHP_API_URL = "api/contact.php";
  const VERCEL_API_URL = "/api/contact";
  const STATIC_HOST_PATTERN = /(^|\.)github\.io$|(^|\.)vercel\.app$/i;
  const PRODUCTION_HOSTS = ["logic-roll.com", "www.logic-roll.com"];

  function useVercelApi() {
    const host = location.hostname;
    if (STATIC_HOST_PATTERN.test(host)) return true;
    if (PRODUCTION_HOSTS.includes(host)) return true;
    return false;
  }

  function setStatus(message, type) {
    statusEl.textContent = message;
    statusEl.className = "contact-form__status";
    if (type) statusEl.classList.add(`contact-form__status--${type}`);
  }

  function setLoading(loading) {
    submitBtn.disabled = loading;
    submitBtn.classList.toggle("is-loading", loading);
  }

  function getFormPayload() {
    return {
      name: form.elements.namedItem("name")?.value?.trim() ?? "",
      email: form.elements.namedItem("email")?.value?.trim() ?? "",
      subject: form.elements.namedItem("subject")?.value?.trim() ?? "",
      message: form.elements.namedItem("message")?.value?.trim() ?? "",
    };
  }

  async function submitViaVercelApi(payload) {
    const res = await fetch(VERCEL_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      throw new Error(data.error || data.message || "送信に失敗しました。");
    }
    return data.message || "送信が完了しました。内容を確認のうえ、ご返信いたします。";
  }

  async function submitViaPhp(payload) {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => formData.append(key, value));

    const res = await fetch(PHP_API_URL, {
      method: "POST",
      body: formData,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      throw new Error(data.error || data.message || "送信に失敗しました。");
    }
    return data.message || "送信が完了しました。確認メールをお送りしました。";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setStatus("");

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const payload = getFormPayload();
    setLoading(true);
    setStatus("送信中です…", "pending");

    try {
      const message = useVercelApi()
        ? await submitViaVercelApi(payload)
        : await submitViaPhp(payload);

      setStatus(message, "success");
      form.reset();
    } catch (err) {
      const msg = err.message || "";
      if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
        setStatus(
          "送信できませんでした。通信環境をご確認のうえ、再度お試しください。",
          "error"
        );
      } else {
        setStatus(msg || "送信に失敗しました。時間をおいて再度お試しください。", "error");
      }
    } finally {
      setLoading(false);
    }
  });

  const params = new URLSearchParams(location.search);
  if (params.get("sent") === "1") {
    setStatus("送信が完了しました。ありがとうございます。", "success");
  }
})();
