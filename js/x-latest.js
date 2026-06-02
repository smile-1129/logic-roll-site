(function () {
  const container = document.getElementById("x-latest-post");
  if (!container) return;

  const profileUrl = "https://x.com/logicroll_info";

  function renderEmpty(message) {
    container.innerHTML = `
      <p class="x-latest-empty">${message}</p>
      <p class="x-latest-empty x-latest-empty--sub">
        投稿が増えたあと、ここに最新の1件が表示されます。
      </p>
    `;
  }

  function renderWidgets() {
    if (window.twttr && window.twttr.widgets) {
      window.twttr.widgets.load(container);
    }
  }

  fetch("/api/latest-tweet")
    .then((res) => res.json())
    .then((data) => {
      if (!data.ok) {
        if (data.reason === "no_posts") {
          renderEmpty("現在、表示できる投稿がありません。");
        } else {
          renderEmpty("投稿を読み込めませんでした。");
        }
        return;
      }

      container.innerHTML = data.html;

      if (window.twttr && window.twttr.ready) {
        window.twttr.ready(renderWidgets);
      } else {
        window.addEventListener("load", renderWidgets);
      }
    })
    .catch(() => {
      renderEmpty("投稿を読み込めませんでした。");
    });
})();
