import { JupyterFrontEnd } from '@jupyterlab/application';
import { ICommandPalette, showDialog, Dialog} from '@jupyterlab/apputils';

export const navCommands: NavCommandOptions[] = [
    {
      id: 'fornax:cpanel',
      label: 'Server Control',
      diag_body: 'Are you sure you want to navigate to the control panel?',
      navlink: '/hub/home'
    },
    {
      id: 'fornax:logout',
      label: 'Logout',
      diag_body: 'Are you sure you want to logout?',
      navlink: '/hub/logout'
    }
  ];

export interface NavCommandOptions {
    id: string,
    label: string,
    diag_body: string,
    navlink: string,
}
  
export function CreateNavCommand(
    category: string,
    options: NavCommandOptions,
    palette: ICommandPalette,
    app: JupyterFrontEnd): string 
{
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
            console.debug(`Navigating to ${options.navlink}. Origin: ${orig}`);
            window.location.href = options.navlink;
        }
        }
    });
    // the this command to the command palette
    palette.addItem({command: command, category,
        args: { origin: 'From the palette' }
    });

    return command;
}