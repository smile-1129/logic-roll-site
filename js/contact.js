(function () {
  const form = document.getElementById("contact-form");
  const statusEl = document.getElementById("contact-status");
  const submitBtn = document.getElementById("contact-submit");
  if (!form || !statusEl || !submitBtn) return;

  function setStatus(message, type) {
    statusEl.textContent = message;
    statusEl.className = "contact-form__status";
    if (type) statusEl.classList.add(`contact-form__status--${type}`);
  }

  const params = new URLSearchParams(location.search);
  if (params.get("sent") === "1") {
    setStatus("送信が完了しました。ありがとうございます。", "success");
    if (history.replaceState) {
      const url = new URL(location.href);
      url.searchParams.delete("sent");
      history.replaceState(null, "", url.pathname + url.hash);
    }
  }

  form.addEventListener("submit", (e) => {
    if (!form.checkValidity()) {
      e.preventDefault();
      form.reportValidity();
      return;
    }

    setStatus("送信中です…", "pending");
    submitBtn.disabled = true;
  });
})();
