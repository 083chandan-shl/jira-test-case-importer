// TODO: Datei entfernen, da vermutlich nicht benutzt. Vorher Benutzung prüfen
import { writeFile } from 'fs/promises';

const AUTH_API_URL = 'https://xray.cloud.getxray.app/api/v2/authenticate';
const DOWNLOAD_API_URL =
  'https://xray.cloud.getxray.app/api/v2/export/cucumber';

/**
 * Transforms an array of Jira issue keys (eg. ["BTA-123", "BTA-456"]) into a string,
 * delimited by the given character in parameter {@param delimiter} (defaults to
 * ";"). The result of this function can be used to query the Xray Cloud API to export
 * certain test cases (given as parameter list {@param jiraIssueKeys}) as Cucumber/
 * Gherkin scenario definitions.
 * @param jiraIssueKeys A list of jira issue keys that should be combined into a string,
 *  e.g. (["BTA-123", "BTA-456"])
 * @param delimiter The delimiter how to combine each element of the array together in the
 *  final string. Defaults to ";" (optional)
 * @returns The combined elements of the array, delimited by the given delimiter parameter, e.g. "BTA-123;BTA-456".
 */ // TODO: Create interface signature for function and extract to separate interface (export needed?)
const jiraIssueKeysToString = (
  jiraIssueKeys: string[],
  delimiter: string = ';',
): string => jiraIssueKeys.join(delimiter);

/**
 * This function downloads the Cucumber / Gherkin definitions captured in Xray Cloud through Jira Xray Plugin.
 * @param jiraTestCaseIssueKeys The list of issue keys to download from Xray, e.g. ["BTA-123", "BTA-456"].
 * @returns null
 */
const downloadCucumberTests = async (
  jiraTestCaseIssueKeys: string[],
): Promise<null> => {
  /**
   * The URL to download test case cucumber/Gherkin definitions rom Xray Cloud must
   * contain all the test cases Jira issue keys inside the query parameters.
   * @see https://docs.getxray.app/display/XRAYCLOUD/Exporting+Cucumber+Tests+-+REST+v2
   */
  const dataArrayBuffer = await fetch(
    `${DOWNLOAD_API_URL}?keys=${jiraIssueKeysToString(jiraTestCaseIssueKeys)}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/octet-stream',
      },
    },
  ).then((res) => res.arrayBuffer());
  // const response = await fetch(DOWNLOAD_API_URL);
  // const buffer = Buffer.from(await response.arrayBuffer());
  const buffer = Buffer.from(dataArrayBuffer);
  await writeFile('features.zip', buffer, { encoding: 'utf8' });
  return null;
};

const XrayClient = {
  downloadCucumberTests,
};

/**
 * Used to authenticate against the Xray cloud
 * @see https://docs.getxray.app/display/XRAYCLOUD/Authentication+-+REST+v2
 */
const authenticate = () => {
  const xRayCloudAuthorizeRequest = fetch(AUTH_API_URL);
};

/**
 * Used as wrapper to access certain functionalities to access the Xray Cloud
 * and the date stored therein.
 */
export const xrayClient = () => {};
