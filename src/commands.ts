import { JupyterFrontEnd } from '@jupyterlab/application';
import { ICommandPalette, showDialog, Dialog } from '@jupyterlab/apputils';
import { LabIcon } from '@jupyterlab/ui-components';
import { PageConfig } from '@jupyterlab/coreutils';
import { ILauncher } from '@jupyterlab/launcher';

import fornaxSvg from '../style/fornax.svg';

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
  icon: LabIcon | undefined;
}

// List of navigation items //
const navCommands: INavCommandOptions[] = [
  // navigate to the control panel
  {
    id: 'fornax:gh-docs',
    label: 'User Guide',
    diag_body: null,
    navlink:
      'https://nasa-fornax.github.io/fornax-demo-notebooks/documentation/README.html',
    icon: fornaxIcon
  },
  {
    id: 'fornax:discourse',
    label: 'Help & Support',
    diag_body: null,
    navlink: 'https://discourse.fornax.smce.nasa.gov/',
    icon: fornaxIcon
  },
  {
    id: 'fornax:dashboard',
    label: 'Main Dashboard',
    diag_body: null,
    navlink: 'https://science-console.fornax.smce.nasa.gov/',
    icon: fornaxIcon
  },
  {
    id: 'fornax:cpanel',
    label: 'Shutdown Server',
    //diag_body: 'Are you sure you want to navigate to the scontrol panel?',
    diag_body: null,
    navlink: hubBase + '/hub/home',
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
        window.open(options.navlink, '_blank');
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
export function CreateNavCommands(category: string, palette: ICommandPalette, app: JupyterFrontEnd) {
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