"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XrayClient = void 0;
const api_1 = require("./api");
// TODO: Datei noch verwendet?
/**
 * This client of the Xray Cloud serves the functionality to download Cucumber / Gherkin scenarios as .feature files, as
 * well the possibility to upload test results after an automated test run has been processed.
 */
exports.XrayClient = {
    downloadCucumberTests: api_1.downloadCucumberTests,
    authenticate: api_1.authenticateXrayCloudApiRequest,
    uploadTestResults: api_1.uploadTestResults,
};
