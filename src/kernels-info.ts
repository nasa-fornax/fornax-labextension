export function setupLauncherDescriptions(): void {
  // Kernel descriptions for the Fornax Launcher.
  // These are displayed when the user clicks on the info icon
  // next to each kernel in the launcher.
  const kernelDescriptions: { [key: string]: string } = {
    'python3*':
      'Generic Python 3 environment with many astronomy and science packages pre-installed. Use this if you are unsure which environment to choose.',
    'heasoft*':
      'High Energy Astrophysics Software (HEASoft) environment for X-ray and gamma-ray astronomy. Also used for HEASARC tutorials',
    'ciao*':
      'CIAO (Chandra Interactive Analysis of Observations) environment for analyzing Chandra X-ray data',
    'fermi-gbm*':
      'Fermi GBM (Gamma-ray Burst Monitor) environment for gamma-ray astronomy',
    'fermi*':
      'Fermi Science Tools environment for gammay-ray Fermi data analysis',
    'sas*':
      'XMM SAS (Science Analysis System) environment for analysing XMM-Newton data',
    'irsa-tutorials*':
      'IRSA (Infrared Science Archive) environment for IRSA tutorials',
    'mast-tutorials*':
      'MAST (Mikulski Archive for Space Telescopes) environment for MAST tutorials',
    'Julia*':
      'Generic Julia environment with many astronomy packages pre-installed',
    'R*': 'Generic R environment with many astronomy packages pre-installed'
  };

  const infoIconSvg = `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>`;

  let activeTooltip: HTMLDivElement | null = null;

  const removeTooltip = () => {
    if (activeTooltip) {
      activeTooltip.remove();
      activeTooltip = null;
    }
  };

  // Function to find the description for a given kernel title
  const findDescription = (title: string): string | null => {
    for (const [pattern, description] of Object.entries(kernelDescriptions)) {
      const regexPattern =
        '^' +
        pattern
          .split('*')
          .map(s => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))
          .join('.*') +
        '$';

      // Fix 2: Added 'i' for Case-Insensitive matching
      if (new RegExp(regexPattern, 'i').test(title)) {
        return description;
      }
    }
    return null;
  };

  // Function to add descriptions to the launcher cards
  const addDescriptions = () => {
    const notebookCards = document.querySelectorAll(
      ".jp-LauncherCard[data-category='Notebook']"
    );

    notebookCards.forEach(card => {
      const title =
        card.getAttribute('data-original-title') || card.getAttribute('title');

      if (title) {
        // TEMPORARY DEBUG: Open your browser console to see the exact titles!
        // console.log("Found kernel title:", title);

        const matchedDescription = findDescription(title);

        if (matchedDescription) {
          if (!card.hasAttribute('data-original-title')) {
            card.setAttribute('data-original-title', title);
          }

          const labelDiv = card.querySelector('.jp-LauncherCard-label');

          if (labelDiv && !labelDiv.querySelector('.custom-kernel-info')) {
            card.removeAttribute('title');
            labelDiv.removeAttribute('title');

            const infoIcon = document.createElement('div');
            infoIcon.className = 'custom-kernel-info';
            infoIcon.innerHTML = infoIconSvg;

            infoIcon.addEventListener('click', (e: MouseEvent) => {
              e.preventDefault();
              e.stopPropagation();
              removeTooltip();

              activeTooltip = document.createElement('div');
              activeTooltip.className = 'custom-kernel-click-tooltip';

              // Note: using innerHTML so you can use <a> tags if you want later
              activeTooltip.innerHTML = matchedDescription;

              const rect = infoIcon.getBoundingClientRect();
              activeTooltip.style.top = `${rect.bottom + 8}px`;
              activeTooltip.style.right = `${window.innerWidth - rect.right}px`;

              document.body.appendChild(activeTooltip);

              setTimeout(() => {
                const clickOutsideListener = (docEvent: MouseEvent) => {
                  if (
                    activeTooltip &&
                    !activeTooltip.contains(docEvent.target as Node)
                  ) {
                    removeTooltip();
                    document.removeEventListener('click', clickOutsideListener);
                  }
                };
                document.addEventListener('click', clickOutsideListener);
              }, 0);
            });

            labelDiv.appendChild(infoIcon);
          }
        }
      }
    });
  };

  const observer = new MutationObserver(() => {
    requestAnimationFrame(() => addDescriptions());
  });

  observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener('wheel', removeTooltip, { passive: true });
}
