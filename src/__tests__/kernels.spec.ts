

import { ILauncher } from '@jupyterlab/launcher';
import { IDisposable } from '@lumino/disposable';
import { removeNBKernels, nullDisposable } from '../kernels';


describe('removeNBKernels', () => {
  let mockLauncher: ILauncher;
  let originalAddSpy: jest.Mock;
  const mockDisposable: IDisposable = {
    dispose: jest.fn(),
    isDisposed: false
  };
  let categories: string[] = ['Notebook', 'Console'];


  beforeEach(() => {
    // Reset mocks for each test
    originalAddSpy = jest.fn().mockReturnValue(mockDisposable);
    mockLauncher = {
      add: originalAddSpy
    } as unknown as ILauncher;
  });

  it.each(categories)('should prevent adding %1 kernels matching a pattern', (category: string) => {
    removeNBKernels(mockLauncher, 'py-');
    const optionsWithPattern: ILauncher.IItemOptions = {
      command: 'test:commandWithPattern',
      category: category,
      kernelIconUrl: 'kernelspecs/py-something/python-kernel.svg'
    };

    const result = mockLauncher.add(optionsWithPattern);

    expect(result).toBe(nullDisposable);
    expect(result.isDisposed).toBe(true); // Characteristic of the nullDisposable
    expect(typeof result.dispose).toBe('function');
    expect(originalAddSpy).not.toHaveBeenCalled();

  })

  it.each(categories)('should add %1 kernel matching a pattern', (category: string) => {
    removeNBKernels(mockLauncher, 'py-');
    const optionsWithoutPattern: ILauncher.IItemOptions = {
      command: 'test:commandWithPattern',
      category: category,
      kernelIconUrl: 'kernelspecs/something/python-kernel.svg'
    };

    const result = mockLauncher.add(optionsWithoutPattern);

    expect(result).toBe(mockDisposable); // Should return the result of the original add
    expect(originalAddSpy).toHaveBeenCalledWith(optionsWithoutPattern);
  })

  it('should allow adding non Notebook or Console items', () => {
    removeNBKernels(mockLauncher, 'nb-');

    const optionsNonCat: ILauncher.IItemOptions = {
      command: 'test:commandWithoutIconUrl',
      category: 'Other'
    };

    const result = mockLauncher.add(optionsNonCat);

    expect(result).toBe(mockDisposable);
    expect(originalAddSpy).toHaveBeenCalledWith(optionsNonCat);
  });

  it('should filter out all kernels with an empty pattern', () => {
    removeNBKernels(mockLauncher, ''); // Empty pattern

    const optionsNb: ILauncher.IItemOptions = {
      command: 'test:commandWithIconAndEmptyPattern',
      category: 'Notebook',
      kernelIconUrl: 'kernelspecs/something/python-kernel.svg' // .includes('') is true
    };

    const result = mockLauncher.add(optionsNb);
    expect(result.isDisposed).toBe(true); // Should be filtered
    expect(originalAddSpy).not.toHaveBeenCalled();
  });
});
