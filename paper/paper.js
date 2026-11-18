// Figure lightbox for the HTML paper. Progressive enhancement: every figure is already a
// link to its full-size file (the no-JS fallback); this opens that file enlarged in a native
// modal <dialog> instead, with the caption. Esc, the Close button or a click on the backdrop
// closes it and returns focus to the figure. Phones keep native pinch-zoom; "Zoom" shows the
// figure at twice the screen width to pan by scrolling. No network, no dependencies.
const links = [...document.querySelectorAll('a.figure-zoom')];
if (links.length && typeof HTMLDialogElement === 'function') {
  const dialog = document.createElement('dialog');
  dialog.className = 'lightbox';
  const bar = document.createElement('div'); bar.className = 'lightbox-bar';
  const zoom = document.createElement('button'); zoom.type = 'button'; zoom.className = 'button'; zoom.textContent = 'Zoom';
  zoom.setAttribute('aria-pressed', 'false');
  const close = document.createElement('button'); close.type = 'button'; close.className = 'button'; close.textContent = 'Close';
  bar.append(zoom, close);
  const stage = document.createElement('div'); stage.className = 'lightbox-stage';
  const image = document.createElement('img'); image.decoding = 'async';
  stage.append(image);
  const caption = document.createElement('div'); caption.className = 'lightbox-caption'; caption.id = 'lightbox-caption';
  dialog.setAttribute('aria-labelledby', 'lightbox-caption');
  dialog.append(bar, stage, caption);
  document.body.append(dialog);
  let opener = null;
  const setZoom = on => { stage.classList.toggle('zoomed', on); zoom.setAttribute('aria-pressed', String(on)); zoom.textContent = on ? 'Fit' : 'Zoom'; };
  for (const link of links) {
    link.addEventListener('click', event => {
      event.preventDefault();
      opener = link;
      const figure = link.closest('figure');
      const source = link.querySelector('img');
      image.src = link.getAttribute('href');
      image.alt = source ? source.alt : '';
      caption.replaceChildren(...[...(figure?.querySelector('figcaption')?.childNodes ?? [])].map(node => node.cloneNode(true)));
      setZoom(false);
      dialog.showModal();
      close.focus();
    });
  }
  zoom.addEventListener('click', () => setZoom(!stage.classList.contains('zoomed')));
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => { image.removeAttribute('src'); opener?.focus(); });
}

// Contents sidebar: main sections stay visible; each sub-list (subsections, the appendices)
// sits behind a ▾ toggle. On narrow screens the whole box starts closed. Without JS the
// contents are fully expanded.
const box = document.querySelector('details.toc-box');
if (box) {
  if (!window.matchMedia('(min-width: 64rem)').matches) box.open = false;
  box.querySelectorAll('ol.toc-sub').forEach((list, index) => {
    const item = list.parentElement;
    const name = item.querySelector(':scope > a .toc-text, :scope > .toc-group-title')?.textContent ?? 'section';
    const toggle = document.createElement('button');
    toggle.type = 'button'; toggle.className = 'toc-toggle'; toggle.textContent = '▾';
    list.id = list.id || `toc-sub-${index}`;
    toggle.setAttribute('aria-controls', list.id);
    toggle.setAttribute('aria-label', `Show ${item.classList.contains('toc-group') ? 'the appendices' : `subsections of ${name}`}`);
    const set = open => { list.hidden = !open; toggle.setAttribute('aria-expanded', String(open)); toggle.textContent = open ? '▴' : '▾'; };
    toggle.addEventListener('click', () => set(list.hidden));
    item.querySelector(':scope > a, :scope > .toc-group-title').after(toggle);
    set(false);
  });
}
