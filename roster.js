// Renders roster cards from creators.json, largest audience first.
(function () {
  function fmt(n) {
    if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1e3) return Math.round(n / 1e3) + 'K';
    return String(n);
  }
  function total(c) {
    var p = c.platforms;
    return Object.keys(p).reduce(function (s, k) { return s + (p[k].followers || 0); }, 0);
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch];
    });
  }
  function stat(num, label, url) {
    var inner = '<div class="num">' + num + '</div><div class="label">' + label + '</div>';
    return url
      ? '<a class="stat-link" href="' + esc(url) + '" target="_blank" rel="noopener" aria-label="' + label + ' profile">' + inner + '</a>'
      : '<div>' + inner + '</div>';
  }
  function card(c) {
    var ig = c.platforms.instagram, tt = c.platforms.tiktok;
    var stats = '';
    if (ig) stats += stat(fmt(ig.followers), 'Instagram', ig.url);
    if (tt) stats += stat(fmt(tt.followers), 'TikTok', tt.url);
    stats += stat(fmt(total(c)), 'Total');
    var kit = c.mediaKit
      ? '<a href="' + esc(c.mediaKit) + '" target="_blank" rel="noopener" class="creator-kit">Media kit &rarr;</a>' : '';
    var link = (ig || tt).url;
    return '<div class="creator-card">' +
      '<div class="creator-photo"><img src="' + esc(c.photo) + '" alt="' + esc(c.name) + '" loading="lazy"></div>' +
      '<div class="creator-body"><h3>' + esc(c.name) + '</h3>' +
      '<a href="' + esc(link) + '" target="_blank" rel="noopener" class="creator-handle">' + esc(c.handle) + '</a>' +
      '<p>' + esc(c.niche) + '</p>' +
      '<div class="creator-stats">' + stats + '</div>' + kit + '</div></div>';
  }
  function initCarousel(grid) {
    var root = document.getElementById('roster-carousel');
    var prev = root.querySelector('.carousel-prev'), next = root.querySelector('.carousel-next');
    var dotsEl = document.getElementById('roster-dots');
    function step() {
      var c = grid.querySelector('.creator-card');
      return c ? c.getBoundingClientRect().width + parseFloat(getComputedStyle(grid).columnGap || 28) : 300;
    }
    function per() { return Math.max(1, Math.round(grid.clientWidth / step())); }
    function pages() { return Math.max(1, Math.ceil(grid.children.length / per())); }
    function update() {
      var max = grid.scrollWidth - grid.clientWidth - 2;
      prev.disabled = grid.scrollLeft <= 2;
      next.disabled = grid.scrollLeft >= max;
      var n = pages();
      var idx = max <= 0 ? 0 : Math.min(n - 1, Math.round(grid.scrollLeft / (step() * per())));
      dotsEl.innerHTML = '';
      if (n < 2) return;
      for (var i = 0; i < n; i++) {
        var b = document.createElement('button');
        b.setAttribute('aria-label', 'Go to page ' + (i + 1));
        if (i === idx) b.className = 'on';
        b.onclick = (function (k) { return function () {
          grid.scrollTo({ left: k * step() * per(), behavior: 'smooth' });
        }; })(i);
        dotsEl.appendChild(b);
      }
    }
    function by(dir) { grid.scrollBy({ left: dir * step() * per(), behavior: 'smooth' }); }
    prev.onclick = function () { by(-1); };
    next.onclick = function () { by(1); };
    grid.addEventListener('scroll', function () { window.requestAnimationFrame(update); }, { passive: true });
    window.addEventListener('resize', update);
    grid.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); by(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); by(-1); }
    });
    update();
  }
  fetch('creators.json').then(function (r) { return r.json(); }).then(function (d) {
    var list = d.creators.slice().sort(function (a, b) { return total(b) - total(a); });
    var grid = document.getElementById('roster-grid');
    if (grid) { grid.innerHTML = list.map(card).join(''); initCarousel(grid); }
    var all = list.reduce(function (s, c) { return s + total(c); }, 0);
    document.querySelectorAll('[data-creator-count]').forEach(function (el) { el.textContent = list.length; });
    document.querySelectorAll('[data-combined-followers]').forEach(function (el) {
      el.textContent = (Math.floor(all / 1e5) / 10).toFixed(1) + 'M+';
    });
  });
})();
