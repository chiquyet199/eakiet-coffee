// Decap CMS customisations: insertable blocks for the Markdown editor and site-styled previews.
// Each block is stored in the article as plain HTML (Astro renders raw HTML in Markdown) and must round-trip:
// `pattern` has to match exactly what `toBlock` writes, or the editor shows the block as raw text.
// Class names used here are styled in src/styles/global.css (`.prose …`).

const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const unesc = (s = '') =>
  String(s).replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');

// YouTube (watch, youtu.be, shorts, live, embed) or Facebook video URL → iframe src; null if unrecognised.
function videoEmbedSrc(url) {
  const u = String(url || '').trim();
  const yt = u.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|live\/|embed\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`;
  if (/(?:facebook\.com|fb\.watch)\//.test(u)) {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(u)}&show_text=false`;
  }
  return null;
}

const pullquoteHtml = ({ quote, cite }) =>
  `<blockquote class="pullquote"><p>${esc((quote || '').trim()).replace(/\n/g, '<br>')}</p>${cite ? `<cite>${esc(cite)}</cite>` : ''}</blockquote>`;
const buttonHtml = ({ label, href }) => `<p class="cta-button"><a href="${esc(href)}">${esc(label)}</a></p>`;

const TONES = [
  { label: 'Xanh lá (thông tin, chứng nhận)', value: 'leaf' },
  { label: 'Cam (lưu ý, khuyến mãi)', value: 'ripe' },
  { label: 'Nâu kem (ghi chú chung)', value: 'coffee' },
];

const components = [
  {
    id: 'video',
    label: 'Video (YouTube / Facebook)',
    fields: [
      { name: 'url', label: 'Đường dẫn video', widget: 'string', hint: 'Dán link YouTube hoặc Facebook, vd: https://youtu.be/…' },
      { name: 'title', label: 'Mô tả ngắn (cho người dùng trình đọc màn hình)', widget: 'string', required: false },
    ],
    pattern: /^<div class="embed-video" data-url="([^"]*)"><iframe src="[^"]*" title="([^"]*)"[^>]*><\/iframe><\/div>$/m,
    fromBlock: (m) => ({ url: unesc(m[1]), title: unesc(m[2]) }),
    toBlock: ({ url, title }) => {
      const src = videoEmbedSrc(url);
      if (!src) return `<!-- Link video không hợp lệ: ${esc(url)} -->`;
      return `<div class="embed-video" data-url="${esc(url)}"><iframe src="${esc(src)}" title="${esc(title || 'Video')}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>`;
    },
    toPreview: ({ url, title }) => {
      const src = videoEmbedSrc(url);
      if (!src) return '<p><em>Link video không hợp lệ — chỉ hỗ trợ YouTube và Facebook.</em></p>';
      return `<div class="embed-video"><iframe src="${esc(src)}" title="${esc(title || 'Video')}" allowfullscreen></iframe></div>`;
    },
  },
  {
    id: 'figure',
    label: 'Ảnh có chú thích',
    fields: [
      { name: 'src', label: 'Ảnh', widget: 'image' },
      { name: 'alt', label: 'Mô tả ảnh (hiện khi ảnh không tải được)', widget: 'string', required: false },
      { name: 'caption', label: 'Chú thích dưới ảnh', widget: 'string', required: false },
    ],
    pattern: /^<figure><img src="([^"]*)" alt="([^"]*)" loading="lazy"><figcaption>(.*?)<\/figcaption><\/figure>$/m,
    fromBlock: (m) => ({ src: unesc(m[1]), alt: unesc(m[2]), caption: unesc(m[3]) }),
    toBlock: ({ src, alt, caption }) =>
      `<figure><img src="${esc(src)}" alt="${esc(alt)}" loading="lazy"><figcaption>${esc(caption)}</figcaption></figure>`,
    toPreview: ({ src, alt, caption }, getAsset) =>
      `<figure><img src="${esc(getAsset ? getAsset(src) : src)}" alt="${esc(alt)}"><figcaption>${esc(caption)}</figcaption></figure>`,
  },
  {
    id: 'callout',
    label: 'Khung nổi bật',
    fields: [
      { name: 'tone', label: 'Màu khung', widget: 'select', options: TONES, default: 'leaf' },
      { name: 'title', label: 'Tiêu đề khung', widget: 'string', required: false },
      { name: 'body', label: 'Nội dung', widget: 'markdown', buttons: ['bold', 'italic', 'link', 'bulleted-list', 'numbered-list'], editor_components: [] },
    ],
    // Blank lines around the body let Markdown inside the <aside> render (CommonMark HTML-block rules).
    pattern: /^<aside class="callout callout-(\w+)">\n\n(?:<p class="callout-title">(.*?)<\/p>\n\n)?([\s\S]*?)\n\n<\/aside>$/m,
    fromBlock: (m) => ({ tone: m[1], title: unesc(m[2] || ''), body: m[3] }),
    toBlock: ({ tone, title, body }) =>
      `<aside class="callout callout-${tone || 'leaf'}">\n\n${title ? `<p class="callout-title">${esc(title)}</p>\n\n` : ''}${(body || '').trim()}\n\n</aside>`,
    toPreview: ({ tone, title, body }) =>
      `<aside class="callout callout-${esc(tone || 'leaf')}">${title ? `<p class="callout-title">${esc(title)}</p>` : ''}<p>${esc(body).replace(/\n{2,}/g, '</p><p>')}</p></aside>`,
  },
  {
    id: 'pullquote',
    label: 'Câu trích dẫn lớn',
    fields: [
      { name: 'quote', label: 'Câu trích dẫn', widget: 'text' },
      { name: 'cite', label: 'Người nói / nguồn', widget: 'string', required: false },
    ],
    pattern: /^<blockquote class="pullquote"><p>(.*?)<\/p>(?:<cite>(.*?)<\/cite>)?<\/blockquote>$/m,
    fromBlock: (m) => ({ quote: unesc(m[1].replace(/<br>/g, '\n')), cite: unesc(m[2] || '') }),
    toBlock: pullquoteHtml,
    toPreview: pullquoteHtml,
  },
  {
    id: 'button',
    label: 'Nút kêu gọi (CTA)',
    fields: [
      { name: 'label', label: 'Chữ trên nút', widget: 'string', default: 'Liên hệ báo giá' },
      { name: 'href', label: 'Đường dẫn', widget: 'string', default: '/contact#lien-he', hint: 'Trang trong website bắt đầu bằng /, vd: /products' },
    ],
    pattern: /^<p class="cta-button"><a href="([^"]*)">(.*?)<\/a><\/p>$/m,
    fromBlock: (m) => ({ href: unesc(m[1]), label: unesc(m[2]) }),
    toBlock: buttonHtml,
    toPreview: buttonHtml,
  },
];

if (typeof CMS !== 'undefined') {
  for (const c of components) CMS.registerEditorComponent(c);

  // Preview pane: real site fonts + compiled site CSS (src/pages/admin/preview.css.ts), wrapped like the live page.
  CMS.registerPreviewStyle(
    'https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Merriweather:wght@700;900&display=swap&subset=vietnamese',
  );
  CMS.registerPreviewStyle('/admin/preview.css');

  const articlePreview = ({ entry, widgetFor }) =>
    h(
      'article',
      { className: 'mx-auto max-w-3xl px-4 py-8 bg-coffee-50 text-coffee-900 font-sans' },
      h('h1', { className: 'font-serif text-3xl sm:text-4xl' }, entry.getIn(['data', 'title'])),
      entry.getIn(['data', 'excerpt']) ? h('p', { className: 'article-lead mt-4' }, entry.getIn(['data', 'excerpt'])) : null,
      h('div', { className: 'prose mt-8' }, widgetFor('body')),
    );
  CMS.registerPreviewTemplate('news', articlePreview);
  CMS.registerPreviewTemplate('products', articlePreview);
}

if (typeof module !== 'undefined') module.exports = { components, videoEmbedSrc };
