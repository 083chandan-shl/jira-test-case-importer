import * as yauzl from 'yauzl';

import { access, constants } from 'node:fs/promises';
import { dirname, extname } from 'node:path';
import {
  copyFileSync,
  createWriteStream,
  mkdir,
  readdirSync,
  rmSync,
} from 'node:fs';

import { Logger } from 'e2e-logger';

import { dirSync as createDirectorySync } from 'tmp';

import { successfulDownloadResult } from '../XrayClient/api/ExportingCucumberTests';

/**
 * This error is thrown in case the file system permission to access the file with read permission are not sufficient.
 */
class FilePermissionNotSufficientError extends Error {
  constructor(message?: string) {
    if (message !== undefined && message !== '') {
      super(message);
    } else {
      super(
        'The file system permission to access the file with read permission are not sufficient.',
      );
    }
  }
}

/**
 * This error is thrown in case the file for a given file path does not exist.
 */
class FileNotFoundError extends Error { }

/**
 * This error is thrown in case the file for a given file path is not a zip archive file.
 */
class FileNotAZipArchiveError extends Error {
  constructor(filename?: string) {
    super(`The file ${filename ?? filename} is not a zip archive file.`);
  }
}

type CleanupDirectoriesResult = {
  successful?: boolean;
  status: 'NOT STARTED' | 'IN PROGRESS' | 'DONE';
};

/**
 * This class is an agent that manages the cleanup of temporary directories created
 * during the execution of the download of .feature files.
 */
class CleanupTemporaryDirectoriesAgent {
  public static readonly instance = (): CleanupTemporaryDirectoriesAgent =>
    new CleanupTemporaryDirectoriesAgent();
  private constructor() { }

  private cleanupStatus: CleanupDirectoriesResult = { status: 'NOT STARTED' };
  cleanupTemporaryDirectories = async (): Promise<CleanupDirectoriesResult> => {
    this.cleanupStatus.status = 'IN PROGRESS';
    // console.group('local temporary directory cleanup');
    this.cleanup.createdDirectories.forEach((directory) =>
      rmSync(directory, { recursive: true, force: false }),
    );
    // console.groupEnd();
    this.cleanupStatus.status = 'DONE';
    return this.cleanupStatus;
  };
  getCleanupTempoarrayDirectoriesStatus = (): string =>
    this.cleanupStatus.status;
  addDirectory = (recentlyAddedTemporaryDirectory: string) =>
    this.cleanup.createdDirectories.push(recentlyAddedTemporaryDirectory);

  private cleanup: { createdDirectories: string[] } = {
    createdDirectories: [],
  };
}

/**
 * This constant is an agent that manages the cleanup of temporary directories created
 * during the execution of the download of .feature files. It wraps the corresponding
 * class, representing an Singleton.
 */
const cleanupAgent = CleanupTemporaryDirectoriesAgent.instance();

/**
 * This function validates if the file for a given file path can be accessed in terms of set file system permissions.
 * @param forFilePathOfZipArchive The file path for the .zip file to check permissions for.
 * @throws {FilePermissionNotSufficientError} In case a file cannot be accessed.
 */
const validateFileSystemReadPermission = (
  forFilePathOfZipArchive: string,
) => { };

/**
 * This function validates if the given file path represents a file in zip archive format
 * @param forFilePathOfZipArchive
 * @returns {boolean} True if the file is a zip archive file, false otherwise.
 */
const validateZipFileIsArchive = (forFilePathOfZipArchive: string) => {
  var errorMessage = yauzl.validateFileName(forFilePathOfZipArchive);
  if (errorMessage != null) throw new FileNotAZipArchiveError(errorMessage);
  if (extname(forFilePathOfZipArchive) !== '.zip') {
    Logger.log(
      `The selected zip file '${forFilePathOfZipArchive}' to extract feature files from is not a valid zip archive file.`,
      'ERROR',
    );
    throw new FileNotAZipArchiveError(forFilePathOfZipArchive);
  }
  return true;
  try {
    // new AdmZip(forFilePathOfZipArchive, { readEntries: true });
    // const zipFile = new AdmZip(forFilePathOfZipArchive); // TODO: AdmZip auf zlib umstellen
    // Logger.log(zipFile as object, 'DEBUG');
    // if (zipFile != null) return true;
    return false;
  } catch (err) {
    console.log(typeof err);
    Logger.log(
      `The selected zip file '${forFilePathOfZipArchive}' to extract feature files from is not a valid zip archive file.`,
      'ERROR',
      err as Error,
    );
    return false;
  }
};

/**
 * This function ensures that a file for a given file path exists on file system of local machine.
 * @param forFilePathOfZipArchive
 */
const validateFileExists = async (
  forFilePathOfZipArchive: string,
  attempt: number = 0,
): Promise<boolean> =>
  access(forFilePathOfZipArchive, constants.F_OK)
    .then(() => true)
    .catch(async (reason) => {
      if (attempt >= 3) {
        const errorMessage = `Validate accessing downloaded zip file for the ${attempt + 1
          }. time failed.: ${reason}
        Stop retrying to validate access to the file.`;
        Logger.error(errorMessage, reason);
        throw new FileNotFoundError(errorMessage);
      }
      const errorMessage = `Validate accessing downloaded zip file for the ${attempt + 1
        }. time failed.: ${reason}
      Retry access the file in case creation hasn't finished yet.`;
      Logger.warn(errorMessage, reason);
      await validateFileExists(forFilePathOfZipArchive, attempt + 1);
      return true;
    });

/**
 * This function gets a local file system path to the local temporary directory of the system and enriches it with a sub-folder path to store the files to be downloaded by this package into it.
 * @returns {string} The path to the local temporary directory of the file system.
 */
export const getLocalTemporaryDirectory = (): string => {
  return '.'; // TODO: Remove toggle to use directory in temporary directory of operating system
  const tempDir = createDirectorySync({ prefix: 'e2e-test-engine' }).name;
  cleanupAgent.addDirectory(tempDir);
  return tempDir;
};

const unzip = (inputPath: string, outputPath: string) => {
  Logger.log(inputPath, 'DEBUG')
  yauzl.open(inputPath, { lazyEntries: true }, (err, zipFile) => {
    if (err) throw err;
    zipFile.readEntry();
    zipFile.on('entry', (entry) => {
      if (/\/$/.test(entry.fileName)) {
        // directory entry, should not happen, but keep directory structure by creating folder alongside zip file contents
        const folderNameToCreate = entry.fileName;
        mkdir(
          `${outputPath}/${folderNameToCreate}`,
          { recursive: true },
          (err) => {
            if (err) throw err;
            zipFile.readEntry();
          },
        );
      } else {
        // file entry, create feature file
        let fileName: string = entry.fileName.replace(',', '_');
        Logger.debug(`Filename to create: ${fileName}`);
        zipFile.openReadStream(entry, (err, readStream) => {
          if (err) throw err;
          mkdir(
            dirname(outputPath + '/' + fileName),
            { recursive: true },
            (err) => {
              if (err) throw err;
              // TODO: Add property to overwrite existing files ot to skip write step of file. A log after the extracting shall sum up the details for each file.
              readStream.pipe(createWriteStream(outputPath + '/' + fileName));
              readStream.on('end', () => {
                zipFile.readEntry();
              });
            },
          );
        });
      }
    });
  });
};

/**
 * This function operates on filesystem, execution zip/unzip to unarchive a given zip file
 * @param zipArchiveFilePath
 * @returns {Promise<string>} The path to the extracted feature files.
 */
const unpackZipArchiveFile = async (
  downloadFileObject: successfulDownloadResult,
): Promise<string> => {
  Logger.log(
    `Unpacking zip archive for download result ${downloadFileObject.fullPath}`,
    'DEBUG',
  );
  if (!(await validateFileExists(downloadFileObject.fullPath))) {
    const errorMessage = `The file ${downloadFileObject.fullPath} does not exist.`;
    Logger.log(errorMessage, 'ERROR');
    throw new FileNotFoundError(errorMessage);
  }
  Logger.log(downloadFileObject, 'DEBUG');
  if (!validateZipFileIsArchive(downloadFileObject.filename)) {
    const errorMessage =
      'The selected zip file to extract feature files from is not a valid zip archive file.';
    Logger.log(errorMessage, 'ERROR');
    throw new FileNotAZipArchiveError(errorMessage);
  }
  ZipFileUnpacker.instance().featureFileStatuses = 'UNPACKING';
  unzip(downloadFileObject.fullPath, destinationDirectory as string);
  ZipFileUnpacker.instance().featureFileStatuses = 'UNPACKED';
  return downloadFileObject.path;
};

const destinationDirectory = 'cypress/e2e/cucumber/features';
// // TODO This configuration property was copied from original template repository vc-e2e. Evaluating its name here is obsolete.
// const projectWorkingDirectoryName = 'vc-e2e';
// const destinationDirectory =
//   basename(process.cwd()) === projectWorkingDirectoryName
//     ? `cypress/e2e/cucumber/features`
//     : '';
// if (destinationDirectory === null) {
//   // TODO: Replace error by algorithm that crawls up the directory tree to find the project root directory
//   const message = `The destination directory for the extracted feature files could not be determined.
//   The current working directory is ${process.cwd()}. Please start the script from the project root directory.`;
//   Logger.log(message, 'ERROR');
//   throw new Error(message);
// }

/**
 * This function copies given files from a directory {@param sourceDirectoryPath} to Cypress'
 * destination directory for feature files.
 * @param sourceDirectoryPath The filepath where the extracted feature files are temporarily stored.
 */
const copyExtractedFeatureFilesToDestinationDirectory = async (
  sourceDirectoryPath: string,
) => {
  Logger.log(
    `Copying extracted feature files from ${sourceDirectoryPath} to ${destinationDirectory}`,
    'DEBUG',
  );
  ZipFileUnpacker.instance().featureFileStatuses = 'TO COPY';
  const temporaryLocalDirectoryFiles = readdirSync(sourceDirectoryPath);
  Logger.log('Copying feature files started', 'DEBUG');
  temporaryLocalDirectoryFiles.forEach((file) => {
    if (!file.endsWith('.feature')) return; // To skip all other files than .feature files
    Logger.log(`Copying file: ${file}`, 'DEBUG');
    copyFileSync(`${sourceDirectoryPath}`, `${destinationDirectory}/${file}`);
  });
  Logger.log('Copying feature files completed', 'DEBUG');
  ZipFileUnpacker.instance().featureFileStatuses = 'COPIED';
  cleanupAgent.cleanupTemporaryDirectories();
  Logger.log('Copying finised', 'DEBUG')
};

/**
 * This class serves access to function for unzipping local saved zip archive files of the local file system.
 */
export class ZipFileUnpacker {
  /**
   * This is a singleton instance of the ZipFileUnpacker class.
   */
  private static instanceStore: ZipFileUnpacker;
  private constructor() { }
  /**
   * This function returns the singleton instance of the ZipFileUnpacker class.
   * @returns {ZipFileUnpacker} The singleton instance of the ZipFileUnpacker class.
   */
  static instance = (): ZipFileUnpacker => {
    ZipFileUnpacker.instanceStore === undefined
      ? (ZipFileUnpacker.instanceStore = new ZipFileUnpacker())
      : null;
    return ZipFileUnpacker.instanceStore;
  };
  toBeRemoved: boolean = false; // TODO Für was wird diese property gebraucht?
  /**
   * This property represents the current status of the feature file extraction process.
   */
  featureFileStatuses:
    | 'DOWNLOADED' // covered
    | 'UNPACKING' // covered
    | 'UNPACKED' // covered
    | 'TO COPY' // covered
    | 'COPIED' // covered
    | 'ERROR' = 'DOWNLOADED';
  /**
   * This function returns the current status of the feature file extraction process.
   * @returns {string} The current path to the extracted feature files.
   */
  unpack = unpackZipArchiveFile;
  /**
   * This function copies the extracted feature files to Cypress' destination directory
   * of feature files.
   */
  copyUnpackedFilesToFeatureFilesDestinationDirectory =
    copyExtractedFeatureFilesToDestinationDirectory;
}
