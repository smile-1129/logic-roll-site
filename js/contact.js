(function () {
  const form = document.getElementById("contact-form");
  const statusEl = document.getElementById("contact-status");
  const submitBtn = document.getElementById("contact-submit");
  if (!form || !statusEl || !submitBtn) return;

  const API_URL = "api/contact.php";
  const FORMSUBMIT_EMAIL = "dojinworks.2525@gmail.com";
  const STATIC_HOST_PATTERN = /(^|\.)github\.io$|(^|\.)vercel\.app$/i;
  const PRODUCTION_HOSTS = ["logic-roll.com", "www.logic-roll.com"];

  function useStaticSubmit() {
    const host = location.hostname;
    if (STATIC_HOST_PATTERN.test(host)) return true;
    if (PRODUCTION_HOSTS.includes(host)) return true;
    return location.protocol === "file:";
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

  async function submitViaPhp(formData) {
    const res = await fetch(API_URL, {
      method: "POST",
      body: formData,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      throw new Error(data.error || data.message || "送信に失敗しました。");
    }
    return data.message || "送信が完了しました。確認メールをお送りしました。";
  }

  async function submitViaFormSubmit(formData) {
    formData.append("_subject", `[LOGIC ROLL] ${formData.get("subject") || "お問い合わせ"}`);
    formData.append("_template", "table");
    formData.append("_captcha", "false");

    const res = await fetch(`https://formsubmit.co/ajax/${FORMSUBMIT_EMAIL}`, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: formData,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || "送信に失敗しました。");
    }
    return "送信が完了しました。内容を確認のうえ、ご返信いたします。";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setStatus("");

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    setLoading(true);
    setStatus("送信中です…", "pending");

    try {
      const message = useStaticSubmit()
        ? await submitViaFormSubmit(formData)
        : await submitViaPhp(formData);

      setStatus(message, "success");
      form.reset();
    } catch (err) {
      const msg = err.message || "";
      if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
        setStatus(
          "送信できませんでした。しばらくしてから再度お試しください。",
          "error"
        );
      } else {
        setStatus(msg || "送信に失敗しました。時間をおいて再度お試しください。", "error");
      }
    } finally {
      setLoading(false);
    }
  });
})();
