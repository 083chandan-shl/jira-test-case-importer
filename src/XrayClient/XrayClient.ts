import {
  uploadTestResults,
  authenticateXrayCloudApiRequest,
  downloadCucumberTests,
  AuthenticationResult,
} from './api';
// TODO: Datei noch verwendet?
/**
 * This client of the Xray Cloud serves the functionality to download Cucumber / Gherkin scenarios as .feature files, as
 * well the possibility to upload test results after an automated test run has been processed.
 */
export const XrayClient = {
  downloadCucumberTests: downloadCucumberTests,
  authenticate: authenticateXrayCloudApiRequest,
  uploadTestResults: uploadTestResults,
};
export type { AuthenticationResult };
