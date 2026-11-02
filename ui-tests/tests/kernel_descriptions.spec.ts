import { expect, test } from '@jupyterlab/galata';

test('shows a description for a supported launcher kernel', async ({
  page
}) => {
  await page.waitForSelector('.jp-Launcher-content');

  await page.evaluate(() => {
    const container = document.querySelector(
      '.jp-Launcher-section[data-section="Notebook"] .jp-Launcher-cardContainer'
    );
    if (!container) {
      throw new Error('Notebook launcher card container was not found');
    }

    const card = document.createElement('div');
    card.className = 'jp-LauncherCard';
    card.dataset.category = 'Notebook';
    card.title = 'ciao-4.17';
    card.id = 'test-kernel-description';

    const label = document.createElement('span');
    label.className = 'jp-LauncherCard-label';
    label.title = 'ciao-4.17';
    label.textContent = 'ciao-4.17';
    card.appendChild(label);
    container.appendChild(card);
  });

  const card = page.locator('#test-kernel-description');
  const infoIcon = card.locator('.custom-kernel-info');
  await expect(infoIcon).toBeVisible();
  await expect(card).toHaveAttribute('data-original-title', 'ciao-4.17');
  await expect(card).not.toHaveAttribute('title');

  await infoIcon.click();
  const tooltip = page.locator('.custom-kernel-click-tooltip');
  await expect(tooltip).toContainText(
    'CIAO (Chandra Interactive Analysis of Observations)'
  );

  await page
    .locator('.jp-Launcher-content')
    .click({ position: { x: 10, y: 10 } });
  await expect(tooltip).toHaveCount(0);
});
