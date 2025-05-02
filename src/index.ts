import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ICommandPalette } from '@jupyterlab/apputils';
import { ILauncher } from '@jupyterlab/launcher';

import { navCommands, CreateNavCommand } from './navCommands';
import { removeNBKernels } from './kernels';

// Some variables //
const PLUGIN_ID = 'fornax-labextension:plugin';
const COMMAND_CATEGORY = 'Fornax Commands';

// Create wrappers around the keepalive commands
// so we can add them to the Fornax-menu
function keepAliveCommands(app: JupyterFrontEnd) {
  const keepalive_start = 'fornax:keepalive-start';
  app.commands.addCommand(keepalive_start, {
    label: 'Start Keep-alive Session',
    execute: async () => {
      app.commands.execute('keepalive:start-dialog');
    }
  });

  const keepalive_stop = 'fornax:keepalive-stop';
  app.commands.addCommand(keepalive_stop, {
    label: 'Stop Keep-alive Session',
    execute: async () => {
      app.commands.execute('keepalive:stop');
    }
  });
}

/*
Activate the extension
- Loop through navCommands and add them to the fornax menu
- Add the keepalive commands to the fornax menu
*/
function activateFornaxExtension(
  app: JupyterFrontEnd,
  palette: ICommandPalette,
  launcher: ILauncher
) {
  console.log('JupyterLab extension fornax-labextension is activated!');

  // remove notebook kernels; those with name: nb-*
  removeNBKernels(launcher, 'py-');

  // Create Navigation Commands //
  navCommands.forEach(commandOptions => {
    CreateNavCommand(COMMAND_CATEGORY, commandOptions, palette, app);
  });
  // -------------------------- //

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

  // Create Wrappers around keep-alive commands so we can
  // have custom labels
  keepAliveCommands(app);
  // ----------------------------------------------------- //
}

/**
 * Initialization data for the fornax-labextension extension.
 */
const fornaxExtension: JupyterFrontEndPlugin<void> = {
  id: PLUGIN_ID,
  description: 'A JupyterLab extension for Fornax',
  autoStart: true,
  requires: [ICommandPalette, ILauncher],
  activate: activateFornaxExtension
};

export default fornaxExtension;
