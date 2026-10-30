import { Widget } from '@lumino/widgets';
import { JupyterFrontEnd } from '@jupyterlab/application';
import { IFrame, MainAreaWidget } from '@jupyterlab/apputils';

interface MySTSearchItem {
  hierarchy?: {
    lvl1?: string;
    lvl2?: string;
    lvl3?: string;
    lvl4?: string;
    lvl5?: string;
    lvl6?: string;
  };
  type: string;
  url: string;
  content?: string;
}

export class DocsSearchWidget extends Widget {
  private searchInput: HTMLInputElement;
  private resultsList: HTMLUListElement;

  private searchIndex: MySTSearchItem[] = [];
  private isIndexLoaded = false;
  private fetchPromise: Promise<boolean> | null = null;

  private app: JupyterFrontEnd;
  private docsWidget: MainAreaWidget<IFrame> | null = null;

  constructor(app: JupyterFrontEnd) {
    super();
    this.app = app;

    this.id = 'fornax-docs-top-search';

    // Base widget styling for the Top Bar
    this.node.style.display = 'flex';
    this.node.style.alignItems = 'center';
    this.node.style.padding = '0 10px';
    this.node.style.position = 'relative'; // Crucial for dropdown positioning

    // Create the Input
    this.searchInput = document.createElement('input');
    this.searchInput.type = 'text';
    this.searchInput.placeholder = 'Search Fornax Docs...';

    // Size and padding
    this.searchInput.style.width = '250px';
    this.searchInput.style.padding = '4px 8px';
    this.searchInput.style.borderRadius = '3px';
    this.searchInput.style.outline = 'none';

    // Light Blue Styling
    this.searchInput.style.backgroundColor = '#e3f2fd';
    this.searchInput.style.color = '#000000';
    this.searchInput.style.border = '1px solid #90caf9';

    // Optional: Make it slightly transition when clicked
    this.searchInput.addEventListener('focus', () => {
      this.searchInput.style.backgroundColor = '#ffffff';
      this.searchInput.style.border = '1px solid var(--jp-brand-color1)';
    });
    this.searchInput.addEventListener('blur', () => {
      this.searchInput.style.backgroundColor = '#e3f2fd';
      this.searchInput.style.border = '1px solid #90caf9';
    });

    // Create the Dropdown Results List
    this.resultsList = document.createElement('ul');
    this.resultsList.style.listStyleType = 'none';
    this.resultsList.style.padding = '0';
    this.resultsList.style.margin = '0';

    // DROPDOWN STYLING
    this.resultsList.style.position = 'absolute';
    this.resultsList.style.top = '100%'; // Push it directly below the input
    this.resultsList.style.right = '10px'; // Align it nicely
    this.resultsList.style.width = '400px'; // Wider than input to show readable text
    this.resultsList.style.maxHeight = '400px';
    this.resultsList.style.overflowY = 'auto';
    this.resultsList.style.backgroundColor = 'var(--jp-layout-color1)';
    this.resultsList.style.border = '1px solid var(--jp-border-color1)';
    this.resultsList.style.boxShadow = 'var(--jp-elevation-z4)'; // Add JupyterLab shadow
    this.resultsList.style.zIndex = '10000'; // Make sure it floats above everything
    this.resultsList.style.display = 'none'; // Hidden by default

    this.node.appendChild(this.searchInput);
    this.node.appendChild(this.resultsList);

    // Attach Event Listeners
    this.searchInput.addEventListener('input', () => {
      this.handleSearch();
    });

    // Hide dropdown when clicking outside
    document.addEventListener('click', event => {
      if (!this.node.contains(event.target as Node)) {
        this.resultsList.style.display = 'none';
      }
    });

    // Show dropdown again if user clicks back into the search box
    this.searchInput.addEventListener('focus', () => {
      if (this.searchInput.value.trim() !== '') {
        this.resultsList.style.display = 'block';
      }
    });
  }

  private async ensureIndexLoaded(): Promise<boolean> {
    if (this.isIndexLoaded) return true;
    if (this.fetchPromise) return this.fetchPromise;

    this.resultsList.style.display = 'block';
    this.resultsList.innerHTML =
      '<li style="padding: 8px; color: var(--jp-ui-font-color2);"><em>Loading search index...</em></li>';

    this.fetchPromise = (async () => {
      try {
        const response = await fetch(
          'https://docs.fornax.sciencecloud.nasa.gov/myst.search.json'
        );
        const rawData = await response.json();

        if (rawData.records && Array.isArray(rawData.records)) {
          this.searchIndex = rawData.records;
        } else if (Array.isArray(rawData)) {
          this.searchIndex = rawData;
        } else if (rawData.items && Array.isArray(rawData.items)) {
          this.searchIndex = rawData.items;
        } else {
          this.searchIndex = [];
        }

        this.isIndexLoaded = true;
        return true;
      } catch (error) {
        console.error('Failed to load Fornax docs search index:', error);
        this.resultsList.innerHTML =
          '<li style="color: var(--jp-error-color1); padding: 8px;">Error loading search.</li>';
        return false;
      } finally {
        this.fetchPromise = null;
      }
    })();

    return this.fetchPromise;
  }

  private getTitle(item: MySTSearchItem): string {
    const h = item.hierarchy;
    if (!h) return 'Documentation Page';
    return (
      h.lvl6 ||
      h.lvl5 ||
      h.lvl4 ||
      h.lvl3 ||
      h.lvl2 ||
      h.lvl1 ||
      'Documentation Page'
    );
  }

  private async handleSearch() {
    const query = this.searchInput.value;

    if (query.trim() === '') {
      this.resultsList.style.display = 'none';
      return;
    }

    const success = await this.ensureIndexLoaded();
    if (!success) return;

    const currentQuery = this.searchInput.value.toLowerCase();

    if (currentQuery.trim() === '') {
      this.resultsList.style.display = 'none';
      return;
    }

    const results: MySTSearchItem[] = [];
    const seenUrls = new Set<string>();

    for (const item of this.searchIndex) {
      if (results.length >= 10) break;

      const titleText = this.getTitle(item).toLowerCase();
      const contentText = (item.content || '').toLowerCase();

      if (
        titleText.includes(currentQuery) ||
        contentText.includes(currentQuery)
      ) {
        if (!seenUrls.has(item.url)) {
          seenUrls.add(item.url);
          results.push(item);
        }
      }
    }

    this.renderResults(results);
  }

  private renderResults(results: MySTSearchItem[]) {
    this.resultsList.innerHTML = '';
    this.resultsList.style.display = 'block'; // Show dropdown

    if (results.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'No results found.';
      li.style.color = 'var(--jp-ui-font-color2)';
      li.style.padding = '8px';
      this.resultsList.appendChild(li);
      return;
    }

    results.forEach(item => {
      const li = document.createElement('li');
      li.style.cursor = 'pointer';
      li.style.borderBottom = '1px solid var(--jp-border-color2)';
      li.style.padding = '8px';

      li.addEventListener('mouseenter', () => {
        li.style.backgroundColor = 'var(--jp-layout-color2)';
      });
      li.addEventListener('mouseleave', () => {
        li.style.backgroundColor = 'transparent';
      });

      const displayTitle = this.getTitle(item);

      const titleElement = document.createElement('strong');
      titleElement.textContent = displayTitle;
      titleElement.style.display = 'block';
      titleElement.style.color = 'var(--jp-brand-color1)';
      li.appendChild(titleElement);

      if (item.type === 'content' && item.content) {
        const snippet = document.createElement('span');
        snippet.style.fontSize = '0.85em';
        snippet.style.color = 'var(--jp-ui-font-color2)';
        snippet.style.display = 'block';
        snippet.style.whiteSpace = 'nowrap';
        snippet.style.overflow = 'hidden';
        snippet.style.textOverflow = 'ellipsis';
        snippet.style.marginTop = '4px';

        const matchIndex = item.content
          .toLowerCase()
          .indexOf(this.searchInput.value.toLowerCase());
        const start = Math.max(0, matchIndex - 20);
        let excerpt = item.content
          .substring(start, start + 60)
          .replace(/\n/g, ' ');
        if (start > 0) excerpt = '...' + excerpt;

        snippet.textContent = excerpt;
        li.appendChild(snippet);
      }

      li.addEventListener('click', () => {
        // 1. Hide the dropdown & clear input
        this.resultsList.style.display = 'none';
        this.searchInput.value = '';

        // 2. Open/Update the tab
        const targetUrl = `https://docs.fornax.sciencecloud.nasa.gov${item.url}`;

        if (this.docsWidget && !this.docsWidget.isDisposed) {
          this.docsWidget.content.url = targetUrl;
          this.docsWidget.title.label = displayTitle;
          this.app.shell.activateById(this.docsWidget.id);
        } else {
          const iframe = new IFrame({
            sandbox: [
              'allow-scripts',
              'allow-same-origin',
              'allow-popups',
              'allow-forms'
            ]
          });
          iframe.url = targetUrl;

          this.docsWidget = new MainAreaWidget({ content: iframe });
          this.docsWidget.id = 'fornax-docs-viewer';
          this.docsWidget.title.label = displayTitle;
          this.docsWidget.title.closable = true;

          this.app.shell.add(this.docsWidget, 'main');
        }
      });

      this.resultsList.appendChild(li);
    });
  }
}
