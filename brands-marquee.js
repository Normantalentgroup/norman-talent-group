// Turns each .brand-list into two rows of brand pills scrolling in opposite directions.
// The <ul> stays as the source of truth (edit brand names there) and is kept for screen readers.
(function () {
  document.querySelectorAll('.brand-list').forEach(function (list) {
    var names = Array.prototype.map.call(list.querySelectorAll('li'), function (li) { return li.textContent.trim(); });
    if (!names.length) return;

    var half = Math.ceil(names.length / 2);
    // Short lists: both rows show every brand (second starts mid-list). Longer lists: each row gets its own half.
    var rows = names.length < 10
      ? [names, names.slice(half).concat(names.slice(0, half))]
      : [names.slice(0, half), names.slice(half)];
    var box = document.createElement('div');
    box.className = 'marquee-box';
    box.setAttribute('aria-hidden', 'true');

    rows.forEach(function (row, i) {
      var marquee = document.createElement('div');
      marquee.className = 'marquee' + (i ? ' reverse' : '');
      var track = document.createElement('div');
      track.className = 'marquee-track';
      // Repeat enough copies to cover very wide screens, then the CSS slides by exactly one half.
      var copies = Math.max(2, Math.ceil(16 / row.length)) * 2;
      for (var c = 0; c < copies; c++) {
        row.forEach(function (name) {
          var pill = document.createElement('span');
          pill.className = 'marquee-pill';
          pill.textContent = name;
          track.appendChild(pill);
        });
      }
      marquee.appendChild(track);
      box.appendChild(marquee);
    });

    list.classList.add('sr-only');
    list.after(box);
  });
})();
