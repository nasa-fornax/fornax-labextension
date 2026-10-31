import { expect, test } from '@jupyterlab/galata';

test.describe('kernel hiding', () => {
  test('should hide launcher cards with title starting with "py-" for Notebook and Console', async ({
    page
  }) => {
    // Wait for the launcher to be visible
    await page.waitForSelector('.jp-Launcher-content');

    // Inject mock launcher cards to test the CSS rules
    await page.evaluate(() => {
      const container = document.querySelector(
        '.jp-Launcher-section[data-section="Notebook"] .jp-Launcher-cardContainer'
      ) || document.querySelector('.jp-Launcher-cardContainer');

      if (!container) return;

      // Add a card that should be hidden (Notebook, title starts with py-)
      const hiddenCard = document.createElement('div');
      hiddenCard.className = 'jp-LauncherCard';
      hiddenCard.setAttribute('data-category', 'Notebook');
      hiddenCard.setAttribute('title', 'py-astro');
      hiddenCard.textContent = 'py-astro';
      hiddenCard.id = 'test-hidden-notebook';
      container.appendChild(hiddenCard);

      // Add a card that should be visible (Notebook, title does not start with py-)
      const visibleCard = document.createElement('div');
      visibleCard.className = 'jp-LauncherCard';
      visibleCard.setAttribute('data-category', 'Notebook');
      visibleCard.setAttribute('title', 'Python 3');
      visibleCard.textContent = 'Python 3';
      visibleCard.id = 'test-visible-notebook';
      container.appendChild(visibleCard);

      // Add a Console card that should be hidden
      const hiddenConsole = document.createElement('div');
      hiddenConsole.className = 'jp-LauncherCard';
      hiddenConsole.setAttribute('data-category', 'Console');
      hiddenConsole.setAttribute('title', 'py-science');
      hiddenConsole.textContent = 'py-science';
      hiddenConsole.id = 'test-hidden-console';
      container.appendChild(hiddenConsole);
    });

    // Verify hidden cards
    await expect(page.locator('#test-hidden-notebook')).toBeHidden();
    await expect(page.locator('#test-visible-notebook')).toBeVisible();
    await expect(page.locator('#test-hidden-console')).toBeHidden();
  });
});
