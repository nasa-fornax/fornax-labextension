import { JupyterFrontEnd } from '@jupyterlab/application';
import { ICommandPalette, showDialog, Dialog } from '@jupyterlab/apputils';
import { LabIcon } from '@jupyterlab/ui-components';
import { PageConfig } from '@jupyterlab/coreutils';
import { ILauncher } from '@jupyterlab/launcher';
import { Widget } from '@lumino/widgets';

import fornaxSvg from '../style/fornax.svg';
import { executeUpdateNotebooks } from './handler';

const baseUrl = PageConfig.getBaseUrl();
const match = baseUrl.match(/^https?:\/\/[^/]+(\/[^/]+)\/user\/[^/]+\/?$/);
const hubBase = match ? match[1] : '/';

const fornaxIcon = new LabIcon({
  name: 'fornax:icon',
  svgstr: fornaxSvg
});

// Hold a naviration item options //
export interface INavCommandOptions {
  id: string;
  label: string;
  navlink: string;
  diag_body: string | null;
  target?: string | '_blank';
  icon: LabIcon | undefined;
}

// List of navigation items //
const navCommands: INavCommandOptions[] = [
  // navigate to the control panel
  {
    id: 'fornax:gh-docs',
    label: 'User Guide',
    diag_body: null,
    navlink: 'https://docs.fornax.sciencecloud.nasa.gov/',
    icon: fornaxIcon
  },
  {
    id: 'fornax:discourse',
    label: 'Help & Support',
    diag_body: null,
    navlink: 'https://discourse.fornax.sciencecloud.nasa.gov/',
    icon: fornaxIcon
  },
  {
    id: 'fornax:dashboard',
    label: 'Main Dashboard',
    diag_body: null,
    navlink: 'https://science-console.fornax.sciencecloud.nasa.gov/',
    icon: fornaxIcon
  },
  {
    id: 'fornax:cpanel',
    label: 'Shutdown Server',
    //diag_body: 'Are you sure you want to navigate to the scontrol panel?',
    diag_body: null,
    navlink: hubBase + '/hub/home',
    target: '_top',
    icon: undefined
  }
];

/*
Add a command to navigate somewhere
Input:
  - category (string): a label to group the commands,
  - options:INavCommandOptions: item properties,
  - palette: ICommandPalette,
  = app: JupyterFrontEnd
*/
export function CreateNavCommand(
  category: string,
  options: INavCommandOptions,
  palette: ICommandPalette,
  app: JupyterFrontEnd
): string {
  // Navigate to the requested location
  const command = options.id;
  app.commands.addCommand(command, {
    label: options.label,
    icon: options.icon,
    execute: async (args: any) => {
      if (options.diag_body === null) {
        window.open(options.navlink, options.target);
      } else {
        const result = await showDialog({
          title: 'Confirmation',
          body: options.diag_body,
          buttons: [Dialog.cancelButton(), Dialog.okButton({ label: 'Yes' })]
        });
        const orig = args['origin'];
        if (result.button.accept) {
          console.debug(`Navigating to ${options.navlink}. Origin: ${orig}`);
          window.location.href = options.navlink;
        }
      }
    }
  });
  // add this command to the command palette
  // Adding it to the Fornax menu is done in schema.json
  palette.addItem({
    command: command,
    category,
    args: { origin: 'From the palette' }
  });

  return command;
}

/*
Create navigation commands. Call CreateNavCommand for each element in navCommands
Input:
  - category (string): a label to group the commands,
  - palette: ICommandPalette,
  - app: JupyterFrontEnd
*/
export function CreateNavCommands(
  category: string,
  palette: ICommandPalette,
  app: JupyterFrontEnd
) {
  navCommands.forEach(commandOptions => {
    CreateNavCommand(category, commandOptions, palette, app);
  });
}

/*
Add Launcher items
Input:
  - launcher: ILauncher,
*/
export function addLauncherItems(launcher: ILauncher) {
  // add link to user guide
  launcher.add({
    command: 'fornax:dashboard',
    category: 'Fornax',
    rank: -1001
  });
  launcher.add({
    command: 'fornax:gh-docs',
    category: 'Fornax',
    rank: -1000
  });
  launcher.add({
    command: 'fornax:discourse',
    category: 'Fornax',
    rank: -900
  });
}

/**
 * Create a command that opens an HTML file in the JupyterLab interface
 * @param app - The JupyterFrontEnd application
 * @param palette - Command palette to add the command to
 * @param category - Category for the command palette
 */
export function addReleaseNotesCommand(
  app: JupyterFrontEnd,
  palette?: ICommandPalette,
  category?: string
): void {
  const commandId = 'fornax:container-release-notes';
  const label = 'Release Notes';
  const htmlFilePath = 'fornax-notebooks/introduction.html';
  const widget = new Widget();
  widget.node.innerHTML = `
    See the <a href="https://github.com/nasa-fornax/fornax-images/blob/develop/introduction.md">Release Notes</a> on github for more information.
  `;
  app.commands.addCommand(commandId, {
    label: label,
    execute: async () => {
      try {
        // Use JupyterLab's built-in document manager to open the HTML file
        await app.commands.execute('docmanager:open', {
          path: htmlFilePath
        });
      } catch (error) {
        console.error('Error opening HTML file:', error);
        await showDialog({
          title: 'Release Notes on GitHub',
          body: widget as unknown as Dialog.IBodyWidget,
          buttons: [Dialog.okButton({ label: 'Close' })]
        });
      }
    }
  });

  // Add to command palette if provided
  if (palette && category) {
    palette.addItem({
      command: commandId,
      category: category
    });
  }
}

/**
 * Create a command that updates the notebooks
 * @param app - The JupyterFrontEnd application
 * @param palette - Command palette to add the command to
 * @param category - Category for the command palette
 */
export function addUpdateNotebooksCommand(
  app: JupyterFrontEnd,
  palette?: ICommandPalette,
  category?: string
): void {
  const commandId = 'fornax:update-notebooks';
  const label = 'Update Notebooks';

  app.commands.addCommand(commandId, {
    label: label,
    execute: async () => {
      try {
        // Show confirmation dialog before updating
        const result = await showDialog({
          title: 'Update Notebooks',
          body: 'This will update Fornax notebooks. Any local changes may be overwritten. Continue?',
          buttons: [Dialog.cancelButton(), Dialog.okButton({ label: 'Update' })]
        });

        if (!result.button.accept) {
          return;
        }

        try {
          // Execute update script
          await executeUpdateNotebooks();

          // Show success message
          await showDialog({
            title: 'Update Complete',
            body: 'Notebooks have been successfully updated.',
            buttons: [Dialog.okButton({ label: 'OK' })]
          });
        } catch (error) {
          // Handle error properly
          const errorMessage =
            error instanceof Error ? error.message : String(error);

          await showDialog({
            title: 'Update Failed',
            body: 'Failed to update notebooks: \nTry running update-notebooks.sh command manually from the terminal.\nIf the issue persists, please contact support.',
            buttons: [Dialog.okButton({ label: 'OK' })]
          });

          console.error('Error updating notebooks:', errorMessage);
        }
      } catch (error) {
        console.error('Error in update notebooks command:', error);
      }
    }
  });

  // Add to command palette if provided
  if (palette && category) {
    palette.addItem({
      command: commandId,
      category: category
    });
  }
}
