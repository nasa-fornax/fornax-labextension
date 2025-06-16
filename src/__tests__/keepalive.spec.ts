import { JupyterFrontEnd } from '@jupyterlab/application';
import { keepAliveCommands } from '../index';

describe('keepAliveCommands', () => {
  let mockApp: Partial<JupyterFrontEnd>;
  let mockCommands: Partial<JupyterFrontEnd['commands']>;
  let mockAddCommand: jest.Mock;
  let mockExecuteCommand: jest.Mock;

  beforeEach(() => {
    // Reset mocks for each test
    mockAddCommand = jest.fn();
    mockExecuteCommand = jest.fn();
    mockCommands = {
      addCommand: mockAddCommand,
      execute: mockExecuteCommand
    };
    mockApp = {
      commands: mockCommands as JupyterFrontEnd['commands']
    };
  });

  it('should add "fornax:keepalive-start" command with correct label', () => {
    keepAliveCommands(mockApp as JupyterFrontEnd);

    expect(mockAddCommand).toHaveBeenCalledWith(
      'fornax:keepalive-start',
      expect.objectContaining({
        label: 'Start Keep-alive Session'
      })
    );
  });

  it('should add "fornax:keepalive-stop" command with correct label', () => {
    keepAliveCommands(mockApp as JupyterFrontEnd);

    expect(mockAddCommand).toHaveBeenCalledWith(
      'fornax:keepalive-stop',
      expect.objectContaining({
        label: 'Stop Keep-alive Session'
      })
    );
  });

  it('should ensure "fornax:keepalive-start" command executes "keepalive:start-dialog"', async () => {
    keepAliveCommands(mockApp as JupyterFrontEnd);

    // Find the call for 'fornax:keepalive-start' in mockAddCommand.mock.calls
    const startCommandCall = mockAddCommand.mock.calls.find(
      call => call[0] === 'fornax:keepalive-start'
    );
    expect(startCommandCall).toBeDefined(); // Ensure the command was added

    // Get the execute function from the command options (second argument to addCommand)
    const startCommandExecute = startCommandCall[1].execute;
    await startCommandExecute(); // Execute the function

    expect(mockExecuteCommand).toHaveBeenCalledWith('keepalive:start-dialog');
  });

  it('should ensure "fornax:keepalive-stop" command executes "keepalive:stop"', async () => {
    keepAliveCommands(mockApp as JupyterFrontEnd);

    const stopCommandCall = mockAddCommand.mock.calls.find(
      call => call[0] === 'fornax:keepalive-stop'
    );
    expect(stopCommandCall).toBeDefined();

    const stopCommandExecute = stopCommandCall[1].execute;
    await stopCommandExecute();

    expect(mockExecuteCommand).toHaveBeenCalledWith('keepalive:stop');
  });

  it('should add exactly two commands', () => {
    keepAliveCommands(mockApp as JupyterFrontEnd);
    expect(mockAddCommand).toHaveBeenCalledTimes(2);
  });
});
