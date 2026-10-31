import * as fs from 'fs';
import * as path from 'path';
import { JSDOM } from 'jsdom';

const cssPath = path.resolve(__dirname, '../../style/base.css');
const css = fs.readFileSync(cssPath, 'utf8');

function createLauncherDOM(cards: { category: string; title: string }[]): JSDOM {
  const cardHTML = cards
    .map(
      c =>
        `<div class="jp-LauncherCard" data-category="${c.category}" title="${c.title}">
          <span class="jp-LauncherCard-label">${c.title}</span>
        </div>`
    )
    .join('\n');

  return new JSDOM(
    `<!DOCTYPE html>
    <html><head><style>${css}</style></head>
    <body>
      <div class="jp-Launcher-content">
        <div class="jp-Launcher-section" data-section="Notebook">
          <div class="jp-Launcher-cardContainer">${cardHTML}</div>
        </div>
      </div>
    </body></html>`,
    { pretendToBeVisual: true }
  );
}

describe('kernel hiding CSS rules', () => {
  it('should hide Notebook cards whose title starts with "py-"', () => {
    const dom = createLauncherDOM([
      { category: 'Notebook', title: 'py-astro' },
      { category: 'Notebook', title: 'Python 3' }
    ]);
    const cards = dom.window.document.querySelectorAll('.jp-LauncherCard');
    const hidden = dom.window.getComputedStyle(cards[0]);
    const visible = dom.window.getComputedStyle(cards[1]);

    expect(hidden.display).toBe('none');
    expect(visible.display).not.toBe('none');
  });

  it('should hide Console cards whose title starts with "py-"', () => {
    const dom = createLauncherDOM([
      { category: 'Console', title: 'py-science' },
      { category: 'Console', title: 'Julia 1.9' }
    ]);
    const cards = dom.window.document.querySelectorAll('.jp-LauncherCard');
    const hidden = dom.window.getComputedStyle(cards[0]);
    const visible = dom.window.getComputedStyle(cards[1]);

    expect(hidden.display).toBe('none');
    expect(visible.display).not.toBe('none');
  });

  it('should not hide cards in other categories even if title starts with "py-"', () => {
    const dom = createLauncherDOM([
      { category: 'Other', title: 'py-something' }
    ]);
    const card = dom.window.document.querySelector('.jp-LauncherCard')!;
    const style = dom.window.getComputedStyle(card);

    expect(style.display).not.toBe('none');
  });

  it('should not hide cards whose title contains "py-" but does not start with it', () => {
    const dom = createLauncherDOM([
      { category: 'Notebook', title: 'scipy-env' }
    ]);
    const card = dom.window.document.querySelector('.jp-LauncherCard')!;
    const style = dom.window.getComputedStyle(card);

    expect(style.display).not.toBe('none');
  });
});
