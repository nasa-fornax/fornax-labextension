import { ILauncher } from '@jupyterlab/launcher';
import { IDisposable } from '@lumino/disposable';

export const nullDisposable: IDisposable = {
  dispose: () => {},
  get isDisposed() {
    return true;
  }
};

/*
Remove notebook kernels from the main launcher page;
but not from the drop down in the notebook selection.
Do it by modifying launcher.add to filter out those
with {pattern} in the name
Input:
  - launcher: ILauncher
  - pattern: string, name pattern, e.g. 'py-'
*/
export function removeNBKernels(launcher: ILauncher, pattern: string) {
  const originalAdd = launcher.add.bind(launcher);
  launcher.add = options => {
    if ((options.category === 'Notebook' || options.category === 'Console') 
        && options.kernelIconUrl?.includes('kernelspecs/' + pattern)) {
      return nullDisposable;
    }
    return originalAdd(options);
  };
}
