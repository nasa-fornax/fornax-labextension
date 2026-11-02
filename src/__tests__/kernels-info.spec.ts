import { setupLauncherDescriptions } from '../kernels-info';

function createLauncherCard(category: string, title: string): HTMLDivElement {
  const card = document.createElement('div');
  card.className = 'jp-LauncherCard';
  card.dataset.category = category;
  card.title = title;

  const label = document.createElement('span');
  label.className = 'jp-LauncherCard-label';
  label.title = title;
  label.textContent = title;
  card.appendChild(label);
  document.body.appendChild(card);

  return card;
}

function waitForLauncherUpdate(): Promise<void> {
  return new Promise(resolve => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => resolve());
    });
  });
}

describe('launcher kernel descriptions', () => {
  beforeAll(() => {
    setupLauncherDescriptions();
  });

  afterEach(() => {
    document.body.replaceChildren();
  });

  it('adds one info icon to a matching Notebook card', async () => {
    const card = createLauncherCard('Notebook', 'CIAO-4.17');
    await waitForLauncherUpdate();

    expect(card.dataset.originalTitle).toBe('CIAO-4.17');
    expect(card.getAttribute('title')).toBeNull();
    expect(
      card.querySelector('.jp-LauncherCard-label')?.getAttribute('title')
    ).toBeNull();
    expect(card.querySelectorAll('.custom-kernel-info')).toHaveLength(1);

    card.appendChild(document.createElement('span'));
    await waitForLauncherUpdate();
    expect(card.querySelectorAll('.custom-kernel-info')).toHaveLength(1);
  });

  it('shows the matching description when its info icon is clicked', async () => {
    const card = createLauncherCard('Notebook', 'fermi-gbm');
    await waitForLauncherUpdate();

    const icon = card.querySelector('.custom-kernel-info')!;
    let cardClicked = false;
    card.addEventListener('click', () => {
      cardClicked = true;
    });
    icon.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    const tooltip = document.querySelector('.custom-kernel-click-tooltip');
    expect(tooltip?.textContent).toBe(
      'Fermi GBM (Gamma-ray Burst Monitor) environment for gamma-ray astronomy'
    );
    expect(cardClicked).toBe(false);

    await new Promise<void>(resolve => window.setTimeout(resolve, 0));
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(document.querySelector('.custom-kernel-click-tooltip')).toBeNull();
  });

  it('does not add an info icon to unsupported kernels or other categories', async () => {
    const unsupportedCard = createLauncherCard('Notebook', 'custom-kernel');
    const consoleCard = createLauncherCard('Console', 'ciao-4.17');
    await waitForLauncherUpdate();

    expect(unsupportedCard.querySelector('.custom-kernel-info')).toBeNull();
    expect(consoleCard.querySelector('.custom-kernel-info')).toBeNull();
  });

  it('closes the tooltip when the page is scrolled', async () => {
    const card = createLauncherCard('Notebook', 'Julia-1.10');
    await waitForLauncherUpdate();
    card
      .querySelector('.custom-kernel-info')!
      .dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(
      document.querySelector('.custom-kernel-click-tooltip')
    ).not.toBeNull();
    window.dispatchEvent(new WheelEvent('wheel'));
    expect(document.querySelector('.custom-kernel-click-tooltip')).toBeNull();
  });
});
