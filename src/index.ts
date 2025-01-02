import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ICommandPalette, showDialog, Dialog} from '@jupyterlab/apputils';

interface NavCommandOptions {
  id: string,
  label: string,
  diag_body: string,
  navlink: string,
}

function CreateNavCommand(options: NavCommandOptions, palette: ICommandPalette, app: JupyterFrontEnd): string {
  const category = 'Fornax Commands';

  // Navigate to the Hub Control Panel
  const command = options.id;
  app.commands.addCommand(command, {
    label: options.label,
    execute: async (args: any) => {
      const result = await showDialog({
        title: 'Confirmation',
        body: options.diag_body,
        buttons: [
          Dialog.cancelButton(),
          Dialog.okButton({ label: 'Yes' })
        ]
      });
      const orig = args['origin'];
      if (result.button.accept) {
        console.log(`Navigating to ${options.navlink}. Origin: ${orig}`);
        //window.location.href = options.navlink;
      }
    }
  });
  // the this command to the command palette
  palette.addItem({command: command, category,
    args: { origin: 'From the palette' }
  });

  return command;
}

/**
 * Initialization data for the fornax-labextension extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'fornax-labextension:plugin',
  description: 'A JupyterLab extension for Fornax',
  autoStart: true,
  requires: [ICommandPalette],
  activate: (app: JupyterFrontEnd, palette: ICommandPalette) => {
    console.log('JupyterLab extension fornax-labextension is activated!');

    // Create Navigation Commands //
    const nav_commands: NavCommandOptions[] = [
      {
        id: 'fornax:cpanel',
        label: 'Server Control',
        diag_body: 'Are you sure you want to navigate to the control panel?',
        navlink: '/hub/controlpanel'
      },
      {
        id: 'fornax:logout',
        label: 'Logout',
        diag_body: 'Are you sure you want to logout?',
        navlink: '/hub/logout'
      }
    ];

    nav_commands.forEach(commandOptions => {
      CreateNavCommand(commandOptions, palette, app);
    });
    // -------------------------- //

    // Create Wrappers around keep-alive commands so we can
    // have custom labels
    const keepalive_start = 'fornax:keepalive-start';
    app.commands.addCommand(keepalive_start, {
      label: "Start Keep-alive Session",
      execute: async () => {
        app.commands.execute("keepalive:start-dialog");
      }
    });
    
    const keepalive_stop = 'fornax:keepalive-stop';
    app.commands.addCommand(keepalive_stop, {
      label: "Stop Keep-alive Session",
      execute: async () => {
        app.commands.execute("keepalive:stop");
      }
    });
    // ----------------------------------------------------- //
  }
};

export default plugin;
