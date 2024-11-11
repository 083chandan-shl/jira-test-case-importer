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
exports.downloadCucumberTests = void 0;
const e2e_logger_1 = require("e2e-logger");
const fs_1 = require("fs");
const ZipFileUnpacker_1 = require("../../ZipFileUnpacker");
const _1 = require(".");
const AuthenticateXrayApiAccess_1 = require("./AuthenticateXrayApiAccess");
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
const downloadCucumberTests = (jiraTestCaseIssueKeys) => __awaiter(void 0, void 0, void 0, function* () {
    const authToken = (0, AuthenticateXrayApiAccess_1.getAuthenticationToken)();
    e2e_logger_1.Logger.log(`For downloading features files from Xray Cloud, using authentication token: ${authToken !== ''
        ? authToken.slice(0, 5) +
            '******' +
            authToken.slice(authToken.length - 5)
        : undefined}`, 'DEBUG');
    if (authToken === undefined || authToken === '') {
        const errorMessage = 'Xray API access not authenticated. Authorize API access before downloading feature files.';
        e2e_logger_1.Logger.log(errorMessage, 'ERROR');
        throw new Error(errorMessage);
    }
    if (jiraTestCaseIssueKeys.length < 1)
        throw Error('No Cucumber tests to download given. The given list of test cases to download is empty.');
    const jiraIssuesJoined = jiraTestCaseIssueKeys.join(';');
    const requestUrl = `${_1.xRayApiBaseUrl}/${xrayApiDownloadFeaturesUrl}` +
        `?keys=${jiraIssuesJoined}&fz=true`;
    // Logger.log(`Auth token ${authToken}`, 'INFO')
    e2e_logger_1.Logger.log(`Requesting features from Xray Cloud ${requestUrl}`, 'INFO');
    const result = yield fetch(requestUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
        },
        credentials: 'same-origin',
    }).catch((error) => {
        const errorMessage = 'Downloading features files zip archive file from Xray Cloud API failed.';
        e2e_logger_1.Logger.log(errorMessage, 'ERROR', error);
        throw new Error(errorMessage + error.message);
    });
    e2e_logger_1.Logger.log(`Xray rate-limit:           ${result.headers.get('X-RateLimit-Limit')}`, 'INFO');
    e2e_logger_1.Logger.log(`Xray rate-limit-remaining: ${result.headers.get('X-RateLimit-Remaining')}`, 'INFO');
    e2e_logger_1.Logger.log(`Xray rate-limit-reset:     ${result.headers.get('X-RateLimit-Reset')}`, 'INFO');
    e2e_logger_1.Logger.log(`Xray Cloud download request response status: ${result.status}`, 'DEBUG');
    if (result.status !== 200)
        throw new Error(`Xray authentication for downloading features files failed. Used authentication information:
  ${(0, AuthenticateXrayApiAccess_1.XrayAuthenticationDetails)()}`);
    const downloadDirectory = (0, ZipFileUnpacker_1.getLocalTemporaryDirectory)();
    // Convert the response to an ArrayBuffer and then to a Buffer
    const buffer = Buffer.from(yield result.arrayBuffer());
    // Write the buffer to a file
    (0, fs_1.writeFile)('features.zip', buffer, (err) => {
        if (err) {
            const errorMessage = 'Error writing Xray Cloud API response to local zip file.';
            e2e_logger_1.Logger.log(errorMessage, 'ERROR', err);
            throw new Error(errorMessage + err.message);
        }
        e2e_logger_1.Logger.log('File saved successfully as features.zip', 'INFO');
    });
    return {
        SUCCESS: {
            message: 'Feature files download successful.',
            path: downloadDirectory,
            filename: 'features.zip',
            fullPath: `${downloadDirectory}/features.zip`,
        },
    };
});
exports.downloadCucumberTests = downloadCucumberTests;
