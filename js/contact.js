(function () {
  const form = document.getElementById("contact-form");
  const statusEl = document.getElementById("contact-status");
  const submitBtn = document.getElementById("contact-submit");
  if (!form || !statusEl || !submitBtn) return;

  const API_URL = "/api/contact";

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
      name: form.elements.namedItem("name")?.value?.trim() ?? "",
      email: form.elements.namedItem("email")?.value?.trim() ?? "",
      subject: form.elements.namedItem("subject")?.value?.trim() ?? "",
      message: form.elements.namedItem("message")?.value?.trim() ?? "",
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
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(getPayload()),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "送信に失敗しました。");
      }

      setStatus(data.message || "送信が完了しました。ありがとうございます。", "success");
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
