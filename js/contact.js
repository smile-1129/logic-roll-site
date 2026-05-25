(function () {
  const form = document.getElementById("contact-form");
  const statusEl = document.getElementById("contact-status");
  const submitBtn = document.getElementById("contact-submit");
  if (!form || !statusEl || !submitBtn) return;

  const API_URL = "api/contact.php";

  function setStatus(message, type) {
    statusEl.textContent = message;
    statusEl.className = "contact-form__status";
    if (type) statusEl.classList.add(`contact-form__status--${type}`);
  }

  function setLoading(loading) {
    submitBtn.disabled = loading;
    submitBtn.classList.toggle("is-loading", loading);
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
      const res = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        throw new Error(data.error || data.message || "送信に失敗しました。");
      }

      setStatus(data.message || "送信が完了しました。", "success");
      form.reset();
    } catch (err) {
      const msg = err.message || "";
      if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
        setStatus(
          "送信できませんでした。PHP対応のサーバーにアップロードし、サイトURLからアクセスしてください。",
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
