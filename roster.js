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
  function stat(num, label) {
    return '<div><div class="num">' + num + '</div><div class="label">' + label + '</div></div>';
  }
  function card(c) {
    var ig = c.platforms.instagram, tt = c.platforms.tiktok;
    var stats = '';
    if (ig) stats += stat(fmt(ig.followers), 'Instagram');
    if (tt) stats += stat(fmt(tt.followers), 'TikTok');
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
  fetch('creators.json').then(function (r) { return r.json(); }).then(function (d) {
    var list = d.creators.slice().sort(function (a, b) { return total(b) - total(a); });
    var grid = document.getElementById('roster-grid');
    if (grid) grid.innerHTML = list.map(card).join('');
    var all = list.reduce(function (s, c) { return s + total(c); }, 0);
    document.querySelectorAll('[data-combined-followers]').forEach(function (el) {
      el.textContent = (Math.floor(all / 1e5) / 10).toFixed(1) + 'M+';
    });
  });
})();
