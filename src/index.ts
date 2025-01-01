import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ICommandPalette, showDialog, Dialog} from '@jupyterlab/apputils';


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
    
    // Category of the commands
    const category = 'Fornax Commands';
    
    // Navigate to the Hub Control Panel
    const cpanel_command = 'fornax:cpanel';
    app.commands.addCommand(cpanel_command, {
      label: 'Server Control',
      execute: async () => {
        const result = await showDialog({
          title: 'Confirmation',
          body: 'Are you sure you want to navigate to the control panel?',
          buttons: [
            Dialog.cancelButton(),
            Dialog.okButton({ label: 'Yes' })
          ]
        });

        if (result.button.accept) {
          console.log('Navigating to Control panel');
          // Place the actual logic or command you want to run here
          window.location.href = '/hub/controlpanel';
        } else {
          console.log('Navigation canceled');
        }
      }
    });
    palette.addItem({command: cpanel_command, category,
      args: { origin: 'cpanel from the palette' }
    });
  }
};

export default plugin;
