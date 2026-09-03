import { createHighlighter, type Highlighter } from 'shiki';

let highlighterPromise: Promise<Highlighter> | null = null;

export async function getHighlighterInstance(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['tokyo-night', 'dark-plus', 'github-light', 'dracula'],
      langs: ['html', 'c', 'javascript', 'css', 'typescript'],
    });
  }
  return highlighterPromise;
}

export async function highlightCode(
  code: string,
  lang: 'html' | 'c' | 'javascript' = 'html',
  theme: 'tokyo-night' | 'dark-plus' | 'github-light' | 'dracula' | string = 'tokyo-night'
): Promise<string> {
  try {
    const highlighter = await getHighlighterInstance();
    const html = highlighter.codeToHtml(code, {
      lang,
      theme,
    });
    // Strip the outer <pre> wrapper so it doesn't nest inside our editor's pre container
    return html.replace(/^<pre[^>]*>/, '').replace(/<\/pre>$/, '');
  } catch (err) {
    console.warn('Shiki highlighting fallback to pre-wrap:', err);
    return `<code>${escapeHtml(code)}</code>`;
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
