import { JupyterFrontEnd } from '@jupyterlab/application';
import { ICommandPalette, showDialog, Dialog} from '@jupyterlab/apputils';

// Hold a naviration item options //
interface NavCommandOptions {
    id: string,
    label: string,
    diag_body: string,
    navlink: string,
}

// List of navigation items //
export const navCommands: NavCommandOptions[] = [
    // navigate to the control panel
    {
      id: 'fornax:cpanel',
      label: 'Server Control',
      diag_body: 'Are you sure you want to navigate to the control panel?',
      navlink: '/hub/home'
    },
    // navigate to the logout page
    {
      id: 'fornax:logout',
      label: 'Logout',
      diag_body: 'Are you sure you want to logout?',
      navlink: '/hub/logout'
    }
  ];
  
/*
Add a command to navigate somewhere
Input:
  - category (string): a label to group the commands,
  - options: NavCommandOptions: item properties,
  - palette: ICommandPalette,
  = app: JupyterFrontEnd
*/
export function CreateNavCommand(
    category: string,
    options: NavCommandOptions,
    palette: ICommandPalette,
    app: JupyterFrontEnd): string 
{
    // Navigate to the requested location
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
    // add this command to the command palette
    // Adding it to the Fornax menu is done in index.ts
    palette.addItem({command: command, category,
        args: { origin: 'From the palette' }
    });

    return command;
}
