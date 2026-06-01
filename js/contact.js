/**
 * フォームは HTML の action で FormSubmit へ送信します。
 * このファイルは送信完了メッセージ表示のみ行います。
 */
(function () {
  const statusEl = document.getElementById("contact-status");
  if (!statusEl) return;

  if (new URLSearchParams(location.search).get("sent") === "1") {
    statusEl.textContent = "送信が完了しました。ありがとうございます。";
    statusEl.className = "contact-form__status contact-form__status--success";
  }
})();
