"use strict";
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
exports.authenticateXrayCloudApiRequest = exports.ZipFileUnpacker = exports.downloadCucumberTests = exports.getTestCasesForProject = exports.projectFilter = void 0;
const node_path_1 = require("node:path");
const TicketLoader_1 = require("./src/TicketLoader");
Object.defineProperty(exports, "getTestCasesForProject", { enumerable: true, get: function () { return TicketLoader_1.getTestCasesForProject; } });
const XrayClient_1 = require("./src/XrayClient");
Object.defineProperty(exports, "authenticateXrayCloudApiRequest", { enumerable: true, get: function () { return XrayClient_1.authenticateXrayCloudApiRequest; } });
Object.defineProperty(exports, "downloadCucumberTests", { enumerable: true, get: function () { return XrayClient_1.downloadCucumberTests; } });
const ZipFileUnpacker_1 = require("./src/ZipFileUnpacker");
Object.defineProperty(exports, "ZipFileUnpacker", { enumerable: true, get: function () { return ZipFileUnpacker_1.ZipFileUnpacker; } });
const e2e_logger_1 = require("e2e-logger");
// import { Logger } from 'e2e-logger';
exports.projectFilter = 'BTA';
const cypressRun = (0, node_path_1.resolve)(process.argv[1]).includes('lib/plugins/child/require');
console.log(`is cypressRun ? ${cypressRun}`);
if (!cypressRun) {
    /**
     * This parameter holds the CLI argument that was given on executing
     * this package and represents the action the package was started for.
     * @example ```bash
     * npx jira-test-case-importer unpack
     * ```
     */
    const cliPackageActionArg = (process.argv[2] || 'ALL').toUpperCase();
    console.log(`cliPackageActionArg: ${cliPackageActionArg}`);
    /**
     * In regards to specific actions this package has been started for,
     * a filter criteria to select a Jira project will be required. This
     * parameter holds the command line argument for this project filter
     * in case the action in advance meet the given criteria where it's
     * necessary to select a Jira project for.
     * @example "BTA-1234" or undefined
     */
    const cliProjectFilterArg = cliPackageActionArg === 'DOWNLOAD' ||
        cliPackageActionArg === 'ALL' ||
        cliPackageActionArg === 'DOWNLOAD_AND_UNPACK'
        ? process.argv[3]
        : undefined;
    console.log(`cliProjectFilterArg: ${cliProjectFilterArg}`);
    /**
     * This error message is thrown in case an action has been selected,
     * but not the required Jira project filter has been given alongside
     * as command line argument.
     */
    const NoProjectFilterCommandLineArgumentWasGivenErrorMessage = 'No project filter was set as command line argument. Please provide a Jira project key as filter as CLI argument, eg. `npx jira-test-case-importer download <project>`';
    const NoDownloadResultsForUnpackingDownloadedZipFileGivenErrorMessage = '';
    const HelpMessage = `Synopsis:
npx jira-test-case-importer <action> <project filter> <download result path> <download result filename> <download result fullpath>

action:\tOne of: download, unpack_and_copy, all, help
\t- download: Will download given test cases from Jira given by a required <project filter> argument that represents a project key, eg. "BTA".
\t- unpack_and_copy: Will require the download details provided by <action=download> and consumes command line arguments <download result path> <download result filename> <download result fullpath>. It will unpack a downloaded zip file under given local file system path to be extracted into the destination directory of this project.
\t- all: Will run all statements to download all currently available test cases to be downloaded and extract them into the Cypress folder for feature files.
\t- help: Shows this message.

project filter:\tA string representing a Jira project key, eg. "BTA".

download result path:\tA string representing a file system path to a directory wherein a downloaded zip archive containing feature files to be extracted into the Cypress' target directory for feature files. This information is provided from <action=download>. Eg. /some/directory/containing

download result filename:\tA string representing a filename on local file system that has been downloaded and is available as zip archive, containing feature files to be extracted into the Cypress' target directory for feature files. This information is provided from <action=download>. Eg. features.zip

download result fullpath:\tCombined information of arguments "<download result path>/<download result filename>". Eg. /some/directory/containing/features.zip

Hint: Will throw several issues, if parameters in between are not set-up correctly (eg. file system permissions, not available network connections, etc.). Representative error messages will explain the error occurred, in case.`;
    class NoProjectFilterForDownloadFeaturesGivenError extends Error {
        constructor() {
            super(NoProjectFilterCommandLineArgumentWasGivenErrorMessage);
        }
    }
    class MissingDownloadResultForUnpackingLocalZipFileError extends Error {
        constructor() {
            super(NoDownloadResultsForUnpackingDownloadedZipFileGivenErrorMessage);
        }
    }
    /**
     * Wrapper function to asynchronously await for async package functions.
     * @param cliArg
     * @returns
     */
    function evaluateCliArguments(cliArg, projectFilter, unpackPath, unpackFilename, unpackFullPath) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (cliArg) {
                case 'HELP': {
                    return e2e_logger_1.Logger.log(HelpMessage, 'INFO');
                }
                case 'DOWNLOAD': {
                    if (!projectFilter)
                        throw new NoProjectFilterForDownloadFeaturesGivenError();
                    const jiraTestCasesToDownload = [];
                    (yield (0, TicketLoader_1.getTestCasesForProject)(projectFilter)).forEach((testCaseForProject) => jiraTestCasesToDownload.push(testCaseForProject.key));
                    yield (0, XrayClient_1.authenticateXrayCloudApiRequest)();
                    return (0, XrayClient_1.downloadCucumberTests)(jiraTestCasesToDownload);
                }
                case 'UNPACK_AND_COPY': {
                    if (!unpackPath || !unpackFilename || !unpackFullPath)
                        throw new MissingDownloadResultForUnpackingLocalZipFileError();
                    const zfu = ZipFileUnpacker_1.ZipFileUnpacker.instance();
                    const unpackSourceDirectory = yield zfu.unpack({
                        path: unpackPath,
                        filename: unpackFilename,
                        fullPath: unpackFullPath,
                    });
                    return zfu.copyUnpackedFilesToFeatureFilesDestinationDirectory(unpackSourceDirectory);
                }
                default:
                case 'DOWNLOAD_AND_UNPACK':
                case 'ALL': {
                    if (!projectFilter)
                        throw new NoProjectFilterForDownloadFeaturesGivenError();
                    const jiraTestCasesToDownload = [];
                    (yield (0, TicketLoader_1.getTestCasesForProject)(projectFilter)).forEach((testCaseForProject) => jiraTestCasesToDownload.push(testCaseForProject.key));
                    yield (0, XrayClient_1.authenticateXrayCloudApiRequest)();
                    const downloadResult = (yield (0, XrayClient_1.downloadCucumberTests)(jiraTestCasesToDownload));
                    const zfu = ZipFileUnpacker_1.ZipFileUnpacker.instance();
                    const unpackSourceDirectory = yield zfu.unpack(downloadResult.SUCCESS);
                    return zfu.copyUnpackedFilesToFeatureFilesDestinationDirectory(unpackSourceDirectory);
                }
            }
        });
    }
    if (!cypressRun)
        evaluateCliArguments(cliPackageActionArg, cliProjectFilterArg);
}
