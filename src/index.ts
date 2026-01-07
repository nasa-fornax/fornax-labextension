import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ICommandPalette } from '@jupyterlab/apputils';
import { ILauncher } from '@jupyterlab/launcher';
import { HTMLViewerFactory } from '@jupyterlab/htmlviewer';
import { html5Icon } from '@jupyterlab/ui-components';

import {
  CreateNavCommands,
  addLauncherItems,
  addReleaseNotesCommand,
  addUpdateNotebooksCommand
} from './commands';
import { removeNBKernels } from './kernels';

// Some variables //
const PLUGIN_ID = 'fornax-labextension:plugin';
const COMMAND_CATEGORY = 'Fornax Commands';
const KERNEL_FILTER_PATTERN = 'py-';

// Create wrappers around the keepalive commands
// so we can add them to the Fornax-menu
// Actual adding is done in schema/plugin.json
export function keepAliveCommands(app: JupyterFrontEnd) {
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
Capture clicks to open links such as 'hub/home' and 'hub/logout' and
force them to open in _top target
*/
export function changeOpenTarget() {
  const origOpen = window.open;
  (window as any).open = function (
    url: string,
    target?: string,
    features?: string
  ) {
    if (
      (!target || target === '_blank') &&
      (url.includes('hub/home') ||
        url.includes('hub/logout') ||
        url.includes('hub/spawn'))
    ) {
      target = '_top';
    }
    return origOpen.call(window, url, target, features);
  };
}

/* Add custom file types and viewers
htm: for XMM help files
*/
export function addCustomFileTypes(app: JupyterFrontEnd) {
  app.docRegistry.addFileType({
    name: 'htm',
    contentType: 'file',
    fileFormat: 'text',
    displayName: 'HTML File',
    extensions: ['.htm'],
    mimeTypes: ['text/html'],
    icon: html5Icon
  });
  const factory = new HTMLViewerFactory({
    name: 'HTM Viewer',
    fileTypes: ['htm'],
    defaultFor: ['htm']
  });
  app.docRegistry.addWidgetFactory(factory);
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

  // remove notebook kernels; those with name: py-*
  removeNBKernels(launcher, KERNEL_FILTER_PATTERN);

  // Create Navigation Commands //
  // Actual adding is done in schema/plugin.json
  CreateNavCommands(COMMAND_CATEGORY, palette, app);

  // Add 'Release Notes' command to the palette
  addReleaseNotesCommand(app, palette, COMMAND_CATEGORY);

  // Add 'Update Notebooks' command to the palette
  addUpdateNotebooksCommand(app, palette, COMMAND_CATEGORY);

  // Add Fornax Launcher items //
  addLauncherItems(launcher);

  // Create Wrappers around keep-alive commands so we can
  // have custom labels
  keepAliveCommands(app);

  // force links to open in _top
  changeOpenTarget();

  // add mime types
  addCustomFileTypes(app);
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
