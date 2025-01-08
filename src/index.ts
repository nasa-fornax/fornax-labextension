import {JupyterFrontEnd, JupyterFrontEndPlugin } from '@jupyterlab/application';

import { ICommandPalette } from '@jupyterlab/apputils';
import { IStateDB } from '@jupyterlab/statedb';

import {navCommands, CreateNavCommand} from './navCommands'

const PLUGIN_ID = 'fornax-labextension:plugin';
const COMMAND_CATEGORY = 'Fornax Commands';

function keepAliveCommands(app: JupyterFrontEnd) {
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
}

function activateFornaxExtension(
  app: JupyterFrontEnd,
  palette: ICommandPalette
) {
  console.log('JupyterLab extension fornax-labextension is activated!');

  // Create Navigation Commands //
  navCommands.forEach(commandOptions => {
    CreateNavCommand(COMMAND_CATEGORY, commandOptions, palette, app);
  });
  // -------------------------- //

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
  requires: [ICommandPalette, IStateDB, JupyterFrontEnd.IPaths],
  activate: activateFornaxExtension
};

export default fornaxExtension;
