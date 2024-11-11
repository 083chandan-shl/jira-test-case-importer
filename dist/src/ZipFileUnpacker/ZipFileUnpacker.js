"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZipFileUnpacker = exports.getLocalTemporaryDirectory = void 0;
const yauzl = __importStar(require("yauzl"));
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const node_fs_1 = require("node:fs");
const e2e_logger_1 = require("e2e-logger");
const tmp_1 = require("tmp");
/**
 * This error is thrown in case the file system permission to access the file with read permission are not sufficient.
 */
class FilePermissionNotSufficientError extends Error {
    constructor(message) {
        if (message !== undefined && message !== '') {
            super(message);
        }
        else {
            super('The file system permission to access the file with read permission are not sufficient.');
        }
    }
}
/**
 * This error is thrown in case the file for a given file path does not exist.
 */
class FileNotFoundError extends Error {
}
/**
 * This error is thrown in case the file for a given file path is not a zip archive file.
 */
class FileNotAZipArchiveError extends Error {
    constructor(filename) {
        super(`The file ${filename !== null && filename !== void 0 ? filename : filename} is not a zip archive file.`);
    }
}
/**
 * This class is an agent that manages the cleanup of temporary directories created
 * during the execution of the download of .feature files.
 */
class CleanupTemporaryDirectoriesAgent {
    constructor() {
        this.cleanupStatus = { status: 'NOT STARTED' };
        this.cleanupTemporaryDirectories = () => __awaiter(this, void 0, void 0, function* () {
            this.cleanupStatus.status = 'IN PROGRESS';
            // console.group('local temporary directory cleanup');
            this.cleanup.createdDirectories.forEach((directory) => (0, node_fs_1.rmSync)(directory, { recursive: true, force: false }));
            // console.groupEnd();
            this.cleanupStatus.status = 'DONE';
            return this.cleanupStatus;
        });
        this.getCleanupTempoarrayDirectoriesStatus = () => this.cleanupStatus.status;
        this.addDirectory = (recentlyAddedTemporaryDirectory) => this.cleanup.createdDirectories.push(recentlyAddedTemporaryDirectory);
        this.cleanup = {
            createdDirectories: [],
        };
    }
}
CleanupTemporaryDirectoriesAgent.instance = () => new CleanupTemporaryDirectoriesAgent();
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
const validateFileSystemReadPermission = (forFilePathOfZipArchive) => { };
/**
 * This function validates if the given file path represents a file in zip archive format
 * @param forFilePathOfZipArchive
 * @returns {boolean} True if the file is a zip archive file, false otherwise.
 */
const validateZipFileIsArchive = (forFilePathOfZipArchive) => {
    var errorMessage = yauzl.validateFileName(forFilePathOfZipArchive);
    if (errorMessage != null)
        throw new FileNotAZipArchiveError(errorMessage);
    if ((0, node_path_1.extname)(forFilePathOfZipArchive) !== '.zip') {
        e2e_logger_1.Logger.log(`The selected zip file '${forFilePathOfZipArchive}' to extract feature files from is not a valid zip archive file.`, 'ERROR');
        throw new FileNotAZipArchiveError(forFilePathOfZipArchive);
    }
    return true;
    try {
        // new AdmZip(forFilePathOfZipArchive, { readEntries: true });
        // const zipFile = new AdmZip(forFilePathOfZipArchive); // TODO: AdmZip auf zlib umstellen
        // Logger.log(zipFile as object, 'DEBUG');
        // if (zipFile != null) return true;
        return false;
    }
    catch (err) {
        console.log(typeof err);
        e2e_logger_1.Logger.log(`The selected zip file '${forFilePathOfZipArchive}' to extract feature files from is not a valid zip archive file.`, 'ERROR', err);
        return false;
    }
};
/**
 * This function ensures that a file for a given file path exists on file system of local machine.
 * @param forFilePathOfZipArchive
 */
const validateFileExists = (forFilePathOfZipArchive_1, ...args_1) => __awaiter(void 0, [forFilePathOfZipArchive_1, ...args_1], void 0, function* (forFilePathOfZipArchive, attempt = 0) {
    return (0, promises_1.access)(forFilePathOfZipArchive, promises_1.constants.F_OK)
        .then(() => true)
        .catch((reason) => __awaiter(void 0, void 0, void 0, function* () {
        if (attempt >= 3) {
            const errorMessage = `Validate accessing downloaded zip file for the ${attempt + 1}. time failed.: ${reason}
        Stop retrying to validate access to the file.`;
            e2e_logger_1.Logger.error(errorMessage, reason);
            throw new FileNotFoundError(errorMessage);
        }
        const errorMessage = `Validate accessing downloaded zip file for the ${attempt + 1}. time failed.: ${reason}
      Retry access the file in case creation hasn't finished yet.`;
        e2e_logger_1.Logger.warn(errorMessage, reason);
        yield validateFileExists(forFilePathOfZipArchive, attempt + 1);
        return true;
    }));
});
/**
 * This function gets a local file system path to the local temporary directory of the system and enriches it with a sub-folder path to store the files to be downloaded by this package into it.
 * @returns {string} The path to the local temporary directory of the file system.
 */
const getLocalTemporaryDirectory = () => {
    return '.'; // TODO: Remove toggle to use directory in temporary directory of operating system
    const tempDir = (0, tmp_1.dirSync)({ prefix: 'e2e-test-engine' }).name;
    cleanupAgent.addDirectory(tempDir);
    return tempDir;
};
exports.getLocalTemporaryDirectory = getLocalTemporaryDirectory;
const unzip = (inputPath, outputPath) => {
    e2e_logger_1.Logger.log(inputPath, 'DEBUG');
    yauzl.open(inputPath, { lazyEntries: true }, (err, zipFile) => {
        if (err)
            throw err;
        zipFile.readEntry();
        zipFile.on('entry', (entry) => {
            if (/\/$/.test(entry.fileName)) {
                // directory entry, should not happen, but keep directory structure by creating folder alongside zip file contents
                const folderNameToCreate = entry.fileName;
                (0, node_fs_1.mkdir)(`${outputPath}/${folderNameToCreate}`, { recursive: true }, (err) => {
                    if (err)
                        throw err;
                    zipFile.readEntry();
                });
            }
            else {
                // file entry, create feature file
                let fileName = entry.fileName.replace(',', '_');
                e2e_logger_1.Logger.debug(`Filename to create: ${fileName}`);
                zipFile.openReadStream(entry, (err, readStream) => {
                    if (err)
                        throw err;
                    (0, node_fs_1.mkdir)((0, node_path_1.dirname)(outputPath + '/' + fileName), { recursive: true }, (err) => {
                        if (err)
                            throw err;
                        // TODO: Add property to overwrite existing files ot to skip write step of file. A log after the extracting shall sum up the details for each file.
                        readStream.pipe((0, node_fs_1.createWriteStream)(outputPath + '/' + fileName));
                        readStream.on('end', () => {
                            zipFile.readEntry();
                        });
                    });
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
const unpackZipArchiveFile = (downloadFileObject) => __awaiter(void 0, void 0, void 0, function* () {
    e2e_logger_1.Logger.log(`Unpacking zip archive for download result ${downloadFileObject.fullPath}`, 'DEBUG');
    if (!(yield validateFileExists(downloadFileObject.fullPath))) {
        const errorMessage = `The file ${downloadFileObject.fullPath} does not exist.`;
        e2e_logger_1.Logger.log(errorMessage, 'ERROR');
        throw new FileNotFoundError(errorMessage);
    }
    e2e_logger_1.Logger.log(downloadFileObject, 'DEBUG');
    if (!validateZipFileIsArchive(downloadFileObject.filename)) {
        const errorMessage = 'The selected zip file to extract feature files from is not a valid zip archive file.';
        e2e_logger_1.Logger.log(errorMessage, 'ERROR');
        throw new FileNotAZipArchiveError(errorMessage);
    }
    ZipFileUnpacker.instance().featureFileStatuses = 'UNPACKING';
    unzip(downloadFileObject.fullPath, destinationDirectory);
    ZipFileUnpacker.instance().featureFileStatuses = 'UNPACKED';
    return downloadFileObject.path;
});
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
const copyExtractedFeatureFilesToDestinationDirectory = (sourceDirectoryPath) => __awaiter(void 0, void 0, void 0, function* () {
    e2e_logger_1.Logger.log(`Copying extracted feature files from ${sourceDirectoryPath} to ${destinationDirectory}`, 'DEBUG');
    ZipFileUnpacker.instance().featureFileStatuses = 'TO COPY';
    const temporaryLocalDirectoryFiles = (0, node_fs_1.readdirSync)(sourceDirectoryPath);
    e2e_logger_1.Logger.log('Copying feature files started', 'DEBUG');
    temporaryLocalDirectoryFiles.forEach((file) => {
        if (!file.endsWith('.feature'))
            return; // To skip all other files than .feature files
        e2e_logger_1.Logger.log(`Copying file: ${file}`, 'DEBUG');
        (0, node_fs_1.copyFileSync)(`${sourceDirectoryPath}`, `${destinationDirectory}/${file}`);
    });
    e2e_logger_1.Logger.log('Copying feature files completed', 'DEBUG');
    ZipFileUnpacker.instance().featureFileStatuses = 'COPIED';
    cleanupAgent.cleanupTemporaryDirectories();
    e2e_logger_1.Logger.log('Copying finised', 'DEBUG');
});
/**
 * This class serves access to function for unzipping local saved zip archive files of the local file system.
 */
class ZipFileUnpacker {
    constructor() {
        this.toBeRemoved = false; // TODO Für was wird diese property gebraucht?
        /**
         * This property represents the current status of the feature file extraction process.
         */
        this.featureFileStatuses = 'DOWNLOADED';
        /**
         * This function returns the current status of the feature file extraction process.
         * @returns {string} The current path to the extracted feature files.
         */
        this.unpack = unpackZipArchiveFile;
        /**
         * This function copies the extracted feature files to Cypress' destination directory
         * of feature files.
         */
        this.copyUnpackedFilesToFeatureFilesDestinationDirectory = copyExtractedFeatureFilesToDestinationDirectory;
    }
}
exports.ZipFileUnpacker = ZipFileUnpacker;
/**
 * This function returns the singleton instance of the ZipFileUnpacker class.
 * @returns {ZipFileUnpacker} The singleton instance of the ZipFileUnpacker class.
 */
ZipFileUnpacker.instance = () => {
    ZipFileUnpacker.instanceStore === undefined
        ? (ZipFileUnpacker.instanceStore = new ZipFileUnpacker())
        : null;
    return ZipFileUnpacker.instanceStore;
};
