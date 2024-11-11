export * from './ExportingCucumberTests';
export * from './UploadTestResults';
export * from './AuthenticateXrayApiAccess';
/**
 * This constant holds the version of the Xray Cloud API that is going to be used. It will be included inside the
 * constant {@constant xRayApiBaseUrl} to form the base URL for the respective API requests.
 * @see https://docs.getxray.app/display/XRAYCLOUD/REST+API - For available versions. Currently only "v1" and "v2"
 *  are supported.
 */
export const xrayApiVersion: 'v1' | 'v2' = 'v2';
/**
 * This constant holds the base URL of the Xray Cloud API. This constant will be expanded for
 * the respective API requests that is going to be made.
 * @see https://docs.getxray.app/display/XRAYCLOUD/REST+API
 */
export const xRayApiBaseUrl = `https://xray.cloud.getxray.app/api/${xrayApiVersion}`;
