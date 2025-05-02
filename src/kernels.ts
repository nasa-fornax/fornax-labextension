import { ILauncher } from '@jupyterlab/launcher';
import { IDisposable } from '@lumino/disposable';

const nullDisposable: IDisposable = {
  dispose: () => {},
  get isDisposed() {
    return true;
  }
};

/*
Remove notebook kernels from the main page;
but not from the drop down in the notebook selection
Input:
  - launcher: ILauncher
  - pattern: string, name pattern, e.g. 'nb-'
*/
export function removeNBKernels(launcher: ILauncher, pattern: string) {
  const originalAdd = launcher.add.bind(launcher);
  launcher.add = options => {
    if (options.kernelIconUrl?.includes(pattern)) {
      return nullDisposable;
    }
    return originalAdd(options);
  };
}
