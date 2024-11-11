import { Readable, finished } from 'stream';

import { Logger } from 'e2e-logger';

import { ReadableStream } from 'stream/web';

import { createWriteStream, writeFile } from 'fs';

import { getLocalTemporaryDirectory } from '../../ZipFileUnpacker';

import { xRayApiBaseUrl } from '.';
import {
  XrayAuthenticationDetails,
  getAuthenticationToken,
} from './AuthenticateXrayApiAccess';

/**
 * This constant holds the URL to request against the Xray API to download the features of a given test case.
 * @see https://docs.getxray.app/display/XRAYCLOUD/Exporting+Cucumber+Tests+-+REST+v2
 */
const xrayApiDownloadFeaturesUrl = 'export/cucumber';
/**
 * This constant holds the URL to request against the Xray API to upload the test results of a given test case.
 * @see https://docs.getxray.app/display/XRAYCLOUD/Import+Execution+Results+-+REST+v2#ImportExecutionResultsRESTv2-CucumberJSONresults
 */
const xrayApiExecutionResultUploadUrl = 'import/execution/cucumber';

export type successfulDownloadResult = {
  /**
   * A message that describes the result of the download operation.
   */
  message?: string;
  /**
   * The path to the downloaded file.
   * @example /var/some/path/to
   */
  path: string;
  /**
   * The filename of the downloaded file.
   * @example file.zip
   */
  filename: string;
  /**
   * The full path to the downloaded file.
   * @example /var/some/path/to/file.zip
   */
  fullPath: string;
};
export type DownloadResult =
  | {
    SUCCESS: successfulDownloadResult;
  }
  | {
    FAILURE: { message: string; error: Error };
  };

export const downloadCucumberTests: (
  jiraTestCaseIssueKeys: string[],
) => Promise<DownloadResult> = async (
  jiraTestCaseIssueKeys: string[],
): Promise<DownloadResult> => {
    const authToken = getAuthenticationToken();
    Logger.log(
      `For downloading features files from Xray Cloud, using authentication token: ${authToken !== ''
        ? authToken.slice(0, 5) +
        '******' +
        authToken.slice(authToken.length - 5)
        : undefined
      }`,
      'DEBUG',
    );
    if (authToken === undefined || authToken === '') {
      const errorMessage =
        'Xray API access not authenticated. Authorize API access before downloading feature files.';
      Logger.log(errorMessage, 'ERROR');
      throw new Error(errorMessage);
    }
    if (jiraTestCaseIssueKeys.length < 1)
      throw Error(
        'No Cucumber tests to download given. The given list of test cases to download is empty.',
      );
    const jiraIssuesJoined = jiraTestCaseIssueKeys.join(';');
    const requestUrl =
      `${xRayApiBaseUrl}/${xrayApiDownloadFeaturesUrl}` +
      `?keys=${jiraIssuesJoined}&fz=true`;
    // Logger.log(`Auth token ${authToken}`, 'INFO')
    Logger.log(`Requesting features from Xray Cloud ${requestUrl}`, 'INFO');
    const result = await fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      credentials: 'same-origin',
    }).catch((error) => {
      const errorMessage =
        'Downloading features files zip archive file from Xray Cloud API failed.';
      Logger.log(errorMessage, 'ERROR', error);
      throw new Error(errorMessage + error.message);
    });


    Logger.log(`Xray rate-limit:           ${result.headers.get('X-RateLimit-Limit')}`, 'INFO');
    Logger.log(`Xray rate-limit-remaining: ${result.headers.get('X-RateLimit-Remaining')}`, 'INFO');
    Logger.log(`Xray rate-limit-reset:     ${result.headers.get('X-RateLimit-Reset')}`, 'INFO');
    Logger.log(`Xray Cloud download request response status: ${result.status}`, 'DEBUG');
    if (result.status !== 200)
      throw new Error(`Xray authentication for downloading features files failed. Used authentication information:
  ${XrayAuthenticationDetails()}`);

    const downloadDirectory = getLocalTemporaryDirectory();

    // Convert the response to an ArrayBuffer and then to a Buffer
    const buffer = Buffer.from(await result.arrayBuffer());

    // Write the buffer to a file
    writeFile('features.zip', buffer, (err) => {
      if (err) {
        const errorMessage =
          'Error writing Xray Cloud API response to local zip file.';
        Logger.log(errorMessage, 'ERROR', err);
        throw new Error(errorMessage + err.message);
      }
      Logger.log('File saved successfully as features.zip', 'INFO');
    });

    return {
      SUCCESS: {
        message: 'Feature files download successful.',
        path: downloadDirectory,
        filename: 'features.zip',
        fullPath: `${downloadDirectory}/features.zip`,
      },
    };
  };
