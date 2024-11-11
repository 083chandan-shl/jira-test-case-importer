import { existsSync, mkdirSync, createReadStream } from 'node:fs';

import expect from 'expect';

import rewire from 'rewire';

import zlib from 'node:zlib';

import { ZipFileUnpacker } from './ZipFileUnpacker';
import { successfulDownloadResult } from 'src/XrayClient';

class NotImplementedException extends Error {}

describe('ZipFileUnpacker', () => {
  describe('functional scope', () => {
    describe('class', () => {
      it('instantiates without unpacking any files directly', () => {
        const sut = ZipFileUnpacker.instance();
        expect(sut.featureFileStatuses).toEqual('DOWNLOADED');
      });
      it('throws error on load a non zip file by zlib framework', () => {
        const rewireZipFileUnpacker = rewire(
          '../../dist/src/ZipFileUnpacker/ZipFileUnpacker.js',
        );
        const rewireValidateZipFileIsArchive: (
          forFilePathOfZipArchive: string,
        ) => boolean = rewireZipFileUnpacker.__get__(
          'validateZipFileIsArchive',
        );
        const sut = rewireValidateZipFileIsArchive;
        expect(() => sut('./README.md')).toThrowError(
          'The file ./README.md is not a zip archive file.',
        );
      });
      it.only('unzips locally available zip archive file', async () => {
        const mockZipFileInPackageDirectory: successfulDownloadResult = {
          // This "mock"file has to be given as asset for development in project directory of this package
          path: '.',
          filename: 'features.zip',
          fullPath: `./features.zip`,
        };
        expect(existsSync(mockZipFileInPackageDirectory.fullPath)).toBeTruthy();
        const existentFileNameInsideZipArchive = 'bta-123.feature';
        const zipFileUnpacker = ZipFileUnpacker.instance();
        const unzipFolder = await zipFileUnpacker.unpack(
          mockZipFileInPackageDirectory,
        );
        expect(existsSync(unzipFolder)).toBeTruthy();
        expect(
          existsSync(`${unzipFolder}/${existentFileNameInsideZipArchive}`),
        ).toBeTruthy();
      });
      it.skip('throws error when locally no zip archive file is available', () => {
        jest.mock('./ZipFileUnpacker', () => {
          const originalModule = jest.requireActual('./ZipFileUnpacker');
          return {
            __esModule: true,
            // ...originalModule,
            ZipFileUnpacker: {
              ...originalModule.ZipFileUnpacker,
              unpack: () => {
                throw new Error('Invalid filename1');
              },
            },
            unpackZipArchiveFile2: () => {
              throw new Error('Invalid filename2');
            },
          };
        });
        const sut = () =>
          ZipFileUnpacker.instance().unpack({
            filename: 'NOT_EXISTING_FILE.zip',
            path: '.',
            fullPath: './NOT_EXISTING_FILE.zip',
          });

        expect(sut).toThrowError('Invalid filename');
      });
      it('throws error when locally zip archive file cannot be accessed du missing file system permission', () => {});
      it('throws error when locally zip archive file is not a zip archive', () => {});
    });
  });
  describe('supporting functions', () => {
    describe('getLocalTemporaryDirectory()', () => {
      it('returns a string result for a temporary directory of the local file system', () => {
        // given
        const zipFileUnpackerRewire = rewire(
          '../../dist/src/ZipFileUnpacker/ZipFileUnpacker.js',
        );
        const getLocalTemporaryDirectoryRewire = zipFileUnpackerRewire.__get__(
          'getLocalTemporaryDirectory',
        );
        const { cleanup } = zipFileUnpackerRewire.__get__('cleanupAgent');
        const cleanupProperty = cleanup;
        const sut = getLocalTemporaryDirectoryRewire;
        expect(sut).not.toBeUndefined();
        // When
        const result = sut();
        // Then
        expect(result).not.toBeUndefined();
        expect(result.length).not.toBeNull();
        expect(typeof result).toBe('string');
        expect(cleanupProperty.createdDirectories.length).toBe(1);
        console.log(result);
      });
    });
    // describe('class CleanupTemporaryDirectoriesAgent', () => {
    //   let rewired: any; // :CleanupTemporaryDirectoriesAgent
    //   beforeAll(() => {
    //     // prepare rewire of ZipFileUnpacker.CleanupTemporaryDirectoriesAgent
    //     rewired = rewire('../../dist/src/ZipFileUnpacker/ZipFileUnpacker.js');
    //   });
    //   it.skip('should not be instantiable by constructor', () => {
    //     // constructor() should be private / no visible
    //     const sut = rewired.__get__('CleanupTemporaryDirectoriesAgent');
    //     const result = sut;
    //     console.log(result);
    //     // TODO: Prüfen, dass der constructor private ist
    //   });
    //   it.only.each([{ defaultValue: 'NOT STARTED' }])(
    //     `holds the default value '%s' for the cleanup status`,
    //     (expected) => {
    //       // Given
    //       const sut = rewired.__get__('cleanupAgent');
    //       // const nodeFsRmMock = jest.fn(); // TODO: Hier jest Mock des fs.rmSync hinzufügen
    //       jest.doMock('fs', async () => {
    //         await sleep(1000);
    //         function sleep(ms: number) {
    //           return new Promise((resolve) => {
    //             console.log(`Wait ${ms} milliseconds`);
    //             setTimeout(resolve, ms);
    //           });
    //         }
    //       });
    //       // When
    //       sut.cleanupTemporaryDirectories();
    //       // Then
    //       expect(sut.getCleanupTempoarrayDirectoriesStatus()).toEqual(
    //         expected.defaultValue,
    //       );
    //     },
    //   );
    // });
    describe.skip('class CleanupTemporaryDirectoriesAgent', () => {
      let cleanupAgent: any; // :CleanupTemporaryDirectoriesAgent;

      beforeEach(() => {
        const rewired = rewire(
          '../../dist/src/ZipFileUnpacker/ZipFileUnpacker.js',
        );
        const CleanupTemporaryDirectoriesAgent = rewired.__get__(
          'CleanupTemporaryDirectoriesAgent',
        );
        cleanupAgent = CleanupTemporaryDirectoriesAgent.instance();
      });

      afterEach(() => {
        jest.restoreAllMocks();
      });

      it('should have a default cleanup status of "NOT STARTED"', () => {
        expect(cleanupAgent.getCleanupTempoarrayDirectoriesStatus()).toBe(
          'NOT STARTED',
        );
      });

      it('should add a directory to the cleanup list', () => {
        const directory = '/path/to/temp/directory';
        cleanupAgent.addDirectory(directory);
        expect(cleanupAgent['cleanup'].createdDirectories).toContain(directory);
      });

      it.skip('should remove all directories in the cleanup list when cleanupTemporaryDirectories is called', async () => {
        const directory1 = './local/path/to/temp/directory1';
        const directory2 = './local/path/to/temp/directory2';
        mkdirSync(directory1, { recursive: true });
        mkdirSync(directory2, { recursive: true });
        cleanupAgent.addDirectory(directory1);
        cleanupAgent.addDirectory(directory2);

        // console.log(cleanupAgent);
        // console.log(
        //   `Cleaning up in total ${cleanupAgent.cleanup.createdDirectories.length} directories.`,
        // );

        jest.mock('fs', () => ({
          rmSync: jest.fn(),
        }));
        const fs = require('fs');
        const rmSyncMock = jest.spyOn(fs, 'rmSync');
        await cleanupAgent.cleanupTemporaryDirectories();

        expect(rmSyncMock).toHaveBeenCalledWith(directory1, {
          recursive: true,
          force: true,
        });
        expect(rmSyncMock).toHaveBeenCalledWith(directory2, {
          recursive: true,
          force: true,
        });
        expect(cleanupAgent['cleanup'].createdDirectories).toEqual([]);
      });

      it('should update the cleanup status to "IN PROGRESS" when cleanupTemporaryDirectories is called', async () => {
        // const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        // const rmSyncMock = jest.mock('fs', () => ({
        //   rmSync: async () => {
        //     const ms = 1000; /// waiting 1 second
        //     console.log(`Wait for ${ms} seconds`);
        //     await delay(ms);
        //   },
        // }));
        // const jestMock = jest.mock('./ZipFileUnpacker', () => {
        //   CleanupTemporaryDirectoriesAgent: {
        //     getCleanupTempoarrayDirectoriesStatus: () => {
        //       console.log('getCleanupTempoarrayDirectoriesStatus');
        //     };
        //   }
        // });
        // const getCleanupTempoarrayDirectoriesStatus =
        //   cleanupAgent.getCleanupTempoarrayDirectoriesStatus;
        const cleanupStatus =
          cleanupAgent.getCleanupTempoarrayDirectoriesStatus();
        expect(cleanupStatus).toBe('NOT STARTED');

        await cleanupAgent.cleanupTemporaryDirectories();

        expect(cleanupAgent.getCleanupTempoarrayDirectoriesStatus()).toBe(
          'IN PROGRESS',
        );
      });

      it('should update the cleanup status to "DONE" after cleanupTemporaryDirectories completes', async () => {
        await cleanupAgent.cleanupTemporaryDirectories();

        expect(cleanupAgent.getCleanupTempoarrayDirectoriesStatus()).toBe(
          'DONE',
        );
      });
    });
    describe('exceptions', () => {
      describe('FilePermissionNotSufficientError', () => {
        it('can be constructed with no message but displays default error message', () => {});
        it('can be constructed with given message displays as error message', () => {});
      });
    });
  });
});
