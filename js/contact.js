(function () {
  const form = document.getElementById("contact-form");
  const statusEl = document.getElementById("contact-status");
  const submitBtn = document.getElementById("contact-submit");
  if (!form || !statusEl || !submitBtn) return;

  const WEB3FORMS_ACCESS_KEY = "6e19cea6-d011-4ec1-9c58-98d1804df110";

  function setStatus(message, type) {
    statusEl.textContent = message;
    statusEl.className = "contact-form__status";
    if (type) statusEl.classList.add(`contact-form__status--${type}`);
  }

  function setLoading(loading) {
    submitBtn.disabled = loading;
    submitBtn.classList.toggle("is-loading", loading);
  }

  function getPayload() {
    return {
      access_key: WEB3FORMS_ACCESS_KEY,
      name: form.elements.namedItem("name")?.value?.trim() ?? "",
      email: form.elements.namedItem("email")?.value?.trim() ?? "",
      subject: `[LOGIC ROLL] ${form.elements.namedItem("subject")?.value?.trim() ?? ""}`,
      message: form.elements.namedItem("message")?.value?.trim() ?? "",
      from_name: "LOGIC ROLL 公式サイト",
    };
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setStatus("");

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    setLoading(true);
    setStatus("送信中です…", "pending");

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(getPayload()),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        throw new Error(data.message || "送信に失敗しました。");
      }

      setStatus("送信が完了しました。内容を確認のうえ、ご返信いたします。", "success");
      form.reset();
    } catch (err) {
      setStatus(
        err.message || "送信に失敗しました。時間をおいて再度お試しください。",
        "error"
      );
    } finally {
      setLoading(false);
    }
  });
})();
