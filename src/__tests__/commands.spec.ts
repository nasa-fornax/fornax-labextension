import { ILauncher } from '@jupyterlab/launcher';
import { JupyterFrontEnd } from '@jupyterlab/application';
import { ICommandPalette, Dialog } from '@jupyterlab/apputils';
import { LabIcon } from '@jupyterlab/ui-components';
import {
  addLauncherItems,
  CreateNavCommand,
  INavCommandOptions
} from '../commands';

// Mock showDialog from @jupyterlab/apputils
// This needs to be at the top-level.
jest.mock('@jupyterlab/apputils', () => {
  const original = jest.requireActual('@jupyterlab/apputils');
  return {
    ...original,
    showDialog: jest.fn(),
    // Ensure Dialog (used for button types) is still available from the original module
    Dialog: original.Dialog
  };
});
// Import the mocked version for easy typed access in tests
import { showDialog } from '@jupyterlab/apputils';
const mockShowDialog = showDialog as jest.MockedFunction<typeof showDialog>;

describe('Fornax Commands', () => {
  describe('addLauncherItems', () => {
    let mockLauncher: ILauncher;
    let mockAdd: jest.Mock;

    beforeEach(() => {
      // Create a mock for the 'add' method of ILauncher
      mockAdd = jest.fn();
      // Create a mock ILauncher object
      mockLauncher = {
        add: mockAdd
      } as unknown as ILauncher;
    });

    it('should call launcher.add three times', () => {
      // Call the function with the mocked launcher
      addLauncherItems(mockLauncher);

      // Expect the 'add' method to have been called 3 times
      expect(mockAdd).toHaveBeenCalledTimes(3);

      // Optional: You can also check the arguments if needed
      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({ command: 'fornax:dashboard' })
      );
      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({ command: 'fornax:gh-docs' })
      );
      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({ command: 'fornax:discourse' })
      );
    });
  });

  describe('CreateNavCommand', () => {
    let mockApp: Partial<JupyterFrontEnd>;
    let mockCommands: Partial<JupyterFrontEnd['commands']>;
    let mockAddCommand: jest.Mock;
    let mockPalette: Partial<ICommandPalette>;
    let mockPaletteAddItem: jest.Mock;
    let mockWindowOpen: jest.SpyInstance;

    // For window.location.href mocking
    let originalLocation: Location;

    const category = 'Test Category';
    const testIcon = new LabIcon({ name: 'test:icon', svgstr: '<svg></svg>' });

    const baseNavOptions: INavCommandOptions = {
      id: 'test:nav-command',
      label: 'Test Nav Command',
      navlink: 'http://example.com/nav',
      diag_body: null,
      icon: testIcon
    };

    beforeAll(() => {
      originalLocation = window.location;
      delete (globalThis.window as any).location;
      // Simplified mock for window.location, focusing on href
      (globalThis.window as any).location = { href: '' };
    });

    afterAll(() => {
      // Restore original window.location
      (globalThis.window as any).location = originalLocation;
    });

    beforeEach(() => {
      mockAddCommand = jest.fn();
      mockCommands = { addCommand: mockAddCommand };
      mockApp = { commands: mockCommands as JupyterFrontEnd['commands'] };

      mockPaletteAddItem = jest.fn();
      mockPalette = { addItem: mockPaletteAddItem };

      mockShowDialog.mockClear();
      mockWindowOpen = jest.spyOn(window, 'open').mockImplementation(jest.fn());
      (window.location as any).href = 'initial-page.html'; // Reset href for each test
    });

    afterEach(() => {
      mockWindowOpen.mockRestore();
      // jest.clearAllMocks() would also clear mockShowDialog, which is fine.
    });

    it('should add command to app, add item to palette, and return command ID', () => {
      const cmdId = CreateNavCommand(
        category,
        baseNavOptions,
        mockPalette as ICommandPalette,
        mockApp as JupyterFrontEnd
      );

      expect(cmdId).toBe(baseNavOptions.id);
      expect(mockAddCommand).toHaveBeenCalledTimes(1);
      expect(mockAddCommand).toHaveBeenCalledWith(
        baseNavOptions.id,
        expect.objectContaining({
          label: baseNavOptions.label,
          icon: baseNavOptions.icon
        })
      );
      expect(mockPaletteAddItem).toHaveBeenCalledTimes(1);
      expect(mockPaletteAddItem).toHaveBeenCalledWith(
        expect.objectContaining({
          command: baseNavOptions.id,
          category
        })
      );
    });

    describe('command execution logic', () => {
      it('should open new window via window.open if diag_body is null', async () => {
        const options: INavCommandOptions = {
          ...baseNavOptions,
          diag_body: null,
          navlink: 'http://newtab.com'
        };
        CreateNavCommand(
          category,
          options,
          mockPalette as ICommandPalette,
          mockApp as JupyterFrontEnd
        );

        const executeCallback = mockAddCommand.mock.calls[0][1].execute;
        await executeCallback({ origin: 'test-origin' });

        expect(window.open).toHaveBeenCalledTimes(1);
        expect(window.open).toHaveBeenCalledWith(options.navlink, '_blank');
        expect(mockShowDialog).not.toHaveBeenCalled();
        expect(window.location.href).toBe('initial-page.html'); // Should not change current page
      });

      it('should show dialog and navigate current page on "accept" if diag_body is provided', async () => {
        const options: INavCommandOptions = {
          ...baseNavOptions,
          diag_body: 'Are you absolutely sure?',
          navlink: 'http://confirm-nav.com'
        };
        mockShowDialog.mockResolvedValue({
          button: { accept: true, label: 'Yes' }
        } as Dialog.IResult<any>);

        CreateNavCommand(
          category,
          options,
          mockPalette as ICommandPalette,
          mockApp as JupyterFrontEnd
        );
        const executeCallback = mockAddCommand.mock.calls[0][1].execute;
        await executeCallback({ origin: 'test-origin' });

        expect(mockShowDialog).toHaveBeenCalledTimes(1);
        expect(mockShowDialog).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Confirmation',
            body: options.diag_body,
            // Check for the presence of cancel and ok buttons.
            // Dialog.cancelButton() and Dialog.okButton() return specific structures.
            buttons: [Dialog.cancelButton(), Dialog.okButton({ label: 'Yes' })]
          })
        );
        expect(window.open).not.toHaveBeenCalled();
        expect(window.location.href).toBe(options.navlink);
      });

      it('should show dialog and NOT navigate current page on "cancel" if diag_body is provided', async () => {
        const options: INavCommandOptions = {
          ...baseNavOptions,
          diag_body: 'Are you sure?'
        };
        mockShowDialog.mockResolvedValue({
          button: { accept: false, label: 'Cancel' }
        } as Dialog.IResult<any>);

        CreateNavCommand(
          category,
          options,
          mockPalette as ICommandPalette,
          mockApp as JupyterFrontEnd
        );
        const executeCallback = mockAddCommand.mock.calls[0][1].execute;
        await executeCallback({ origin: 'test-origin' });

        expect(mockShowDialog).toHaveBeenCalledTimes(1);
        expect(window.open).not.toHaveBeenCalled();
        expect(window.location.href).toBe('initial-page.html'); // Should remain unchanged
      });
    });
  });
});
