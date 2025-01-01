import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

/**
 * Initialization data for the fornax-labextension extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'fornax-labextension:plugin',
  description: 'A JupyterLab extension for Fornax',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension fornax-labextension is activated!');
  }
};

export default plugin;
