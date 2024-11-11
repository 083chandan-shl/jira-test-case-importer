import { resolve } from 'node:path';

import { getTestCasesForProject } from './src/TicketLoader';
import {
  authenticateXrayCloudApiRequest,
  downloadCucumberTests,
  successfulDownloadResult,
} from './src/XrayClient';
import { ZipFileUnpacker } from './src/ZipFileUnpacker';
import { Logger } from 'e2e-logger';

// import { Logger } from 'e2e-logger';

export const projectFilter: string = 'BTA';

export {
  getTestCasesForProject,
  downloadCucumberTests,
  successfulDownloadResult,
  ZipFileUnpacker,
  authenticateXrayCloudApiRequest,
};

/**
 * These type differs the intended different usages for this package.
 * To either download, unpack or copy as standalone tasks or to
 * run all of these combined. According to these given arguments by
 * cli, the appropriate package functions will be executed. If no
 * argument is given, the package assumes to run all steps combined.
 */
export type SupportedPackageMethods =
  | 'DOWNLOAD'
  | 'download'
  | 'UNPACK_AND_COPY'
  | 'unpack_and_copy'
  | 'DOWNLOAD_AND_UNPACK'
  | 'download_and_unpack'
  | 'HELP'
  | 'help'
  | 'ALL';

const cypressRun: boolean = resolve(process.argv[1]).includes(
  'lib/plugins/child/require',
);
console.log(`is cypressRun ? ${cypressRun}`);

if (!cypressRun) {
  /**
   * This parameter holds the CLI argument that was given on executing
   * this package and represents the action the package was started for.
   * @example ```bash
   * npx jira-test-case-importer unpack
   * ```
   */
  const cliPackageActionArg: SupportedPackageMethods = (
    (process.argv[2] as SupportedPackageMethods | undefined) || 'ALL'
  ).toUpperCase() as SupportedPackageMethods;
  console.log(`cliPackageActionArg: ${cliPackageActionArg}`);

  /**
   * In regards to specific actions this package has been started for,
   * a filter criteria to select a Jira project will be required. This
   * parameter holds the command line argument for this project filter
   * in case the action in advance meet the given criteria where it's
   * necessary to select a Jira project for.
   * @example "BTA-1234" or undefined
   */
  const cliProjectFilterArg: string | undefined =
    cliPackageActionArg === 'DOWNLOAD' ||
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
  const NoProjectFilterCommandLineArgumentWasGivenErrorMessage =
    'No project filter was set as command line argument. Please provide a Jira project key as filter as CLI argument, eg. `npx jira-test-case-importer download <project>`';

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
  async function evaluateCliArguments(
    cliArg: string,
    projectFilter?: string,
    unpackPath?: string,
    unpackFilename?: string,
    unpackFullPath?: string,
  ) {
    switch (cliArg) {
      case 'HELP': {
        return Logger.log(HelpMessage, 'INFO');
      }
      case 'DOWNLOAD': {
        if (!projectFilter)
          throw new NoProjectFilterForDownloadFeaturesGivenError();
        const jiraTestCasesToDownload: string[] = [];
        (await getTestCasesForProject(projectFilter)).forEach(
          (testCaseForProject) =>
            jiraTestCasesToDownload.push(testCaseForProject.key),
        );
        await authenticateXrayCloudApiRequest();
        return downloadCucumberTests(jiraTestCasesToDownload);
      }
      case 'UNPACK_AND_COPY': {
        if (!unpackPath || !unpackFilename || !unpackFullPath)
          throw new MissingDownloadResultForUnpackingLocalZipFileError();
        const zfu = ZipFileUnpacker.instance();
        const unpackSourceDirectory: string = await zfu.unpack({
          path: unpackPath,
          filename: unpackFilename,
          fullPath: unpackFullPath,
        });
        return zfu.copyUnpackedFilesToFeatureFilesDestinationDirectory(
          unpackSourceDirectory,
        );
      }
      default:
      case 'DOWNLOAD_AND_UNPACK':
      case 'ALL': {
        if (!projectFilter)
          throw new NoProjectFilterForDownloadFeaturesGivenError();
        const jiraTestCasesToDownload: string[] = [];
        (await getTestCasesForProject(projectFilter)).forEach(
          (testCaseForProject) =>
            jiraTestCasesToDownload.push(testCaseForProject.key),
        );
        await authenticateXrayCloudApiRequest();
        const downloadResult = (await downloadCucumberTests(
          jiraTestCasesToDownload,
        )) as { SUCCESS: successfulDownloadResult };
        const zfu = ZipFileUnpacker.instance();
        const unpackSourceDirectory: string = await zfu.unpack(
          downloadResult.SUCCESS,
        );
        return zfu.copyUnpackedFilesToFeatureFilesDestinationDirectory(
          unpackSourceDirectory,
        );
      }
    }
  }
  if (!cypressRun)
    evaluateCliArguments(cliPackageActionArg, cliProjectFilterArg);
}
