import { Logger } from 'e2e-logger';
import { access } from 'node:fs/promises';
import * as dotenv from 'dotenv';
import { xRayApiBaseUrl } from '.';

/**
 * This constant holds the URL to request against the Xray authenticate API.
 * @see https://docs.getxray.app/display/XRAYCLOUD/Authentication+-+REST+v2
 */
const xrayApiAuthenticateUrl = 'authenticate';

const XrayApiAuthenticationDetails = {
  ClientId: 'XRAY-CLIENT-ID',
  ClientSecret: 'XRAY-CLIENT-SECRET',
  toString: () => `XrayApiAuthenticationDetails {
    ClientId: ${XrayApiAuthenticationDetails.ClientId?.slice(0, 4)}*********,
    ClientSecret: ${XrayApiAuthenticationDetails.ClientSecret?.slice(
      0,
      4,
    )}*********,
  }`,
};

const envFilePath = '.env';
export const getEnvFilePath = () => envFilePath;
export const rootLevelDotenvFileExists = async () =>
  access(getEnvFilePath())
    .then(() => true)
    .catch(() => false);

/**
 * This function loads the Xray API authentication details from the .env file located in the root. This function does not overwrite
 * environment variables set by command line arguments and are already available by process.env.
 */
const loadXrayApiAuthenticationDetails = async () => {
  // dotenv that loads the environment variables from the .env file will only publish those variables in case they have not been
  // set by the process.env object, e.g. by command line arguments.
  Logger.log(
    `DotEnv file on root level exists for selecting Xray Cloud authentication details ? ${
      (await rootLevelDotenvFileExists()) ? 'yes' : 'no'
    }`,
    'DEBUG',
  );
  if (await rootLevelDotenvFileExists()) {
    const environmentParametersAlreadyDefined =
      process.env.XRAY_CLIENT_ID !== undefined;
    dotenv.config({ path: getEnvFilePath(), debug: true, encoding: 'utf8' });
    Logger.log(
      `Loaded environment variables for Authorize against Xray Cloud, to receive an access token, from ${
        environmentParametersAlreadyDefined
          ? 'process environment parameters'
          : '.env file'
      }. Saved environment information are:` +
        `
    XRAY_CLIENT_ID: ${process.env.XRAY_CLIENT_ID?.slice(
      0,
      4,
    )}*********${process.env.XRAY_CLIENT_ID?.slice(
          process.env.XRAY_CLIENT_ID.length - 3,
        )},
    XRAY_CLIENT_SECRET: ${process.env.XRAY_CLIENT_SECRET?.slice(
      0,
      4,
    )}*********${process.env.XRAY_CLIENT_SECRET?.slice(
          process.env.XRAY_CLIENT_SECRET.length - 3,
        )}
    `,
      'DEBUG',
    );
  }
  XrayApiAuthenticationDetails.ClientId = process.env.XRAY_CLIENT_ID!;
  XrayApiAuthenticationDetails.ClientSecret = process.env.XRAY_CLIENT_SECRET!;
};

const getAuthenticationUrl = () =>
  `${xRayApiBaseUrl}/${xrayApiAuthenticateUrl}`;
export const fetchAuthenticateXrayCloudApiRequest = async (
  authenticationUrl: string,
) =>
  fetch(authenticationUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: XrayApiAuthenticationDetails.ClientId,
      client_secret: XrayApiAuthenticationDetails.ClientSecret,
    }),
  });

export type AuthenticationResult =
  | 'UNAUTHENTICATED'
  | 'AUTHENTICATED'
  | 'FAILED';

/**
 * Local object (not exported) to temporarily store the authentication information to access the
 * Xray Cloud API.
 */
const XrayAuthentication: {
  status: AuthenticationResult;
  token: string;
  toString: () => string;
} = {
  status: 'UNAUTHENTICATED',
  token: '',
  toString: () => `XrayAuthentication {
    status: ${XrayAuthentication.status},
    token: ${
      XrayAuthentication.token != ''
        ? XrayAuthentication.token.slice(0, 5) +
          '******' +
          XrayAuthentication.token.slice(XrayAuthentication.token.length - 5)
        : undefined
    }
  }`,
};

export const authenticateXrayCloudApiRequest: () => Promise<void> =
  async () => {
    await loadXrayApiAuthenticationDetails();
    const authenticationUrl = getAuthenticationUrl();
    Logger.log(
      'Authenticating against Xray Cloud API ' + authenticationUrl,
      'INFO',
    );
    Logger.log(
      `Using authentication details to receive access token:
    ${XrayApiAuthenticationDetails.toString()}`,
      'DEBUG',
    );
    const response = await fetchAuthenticateXrayCloudApiRequest(
      authenticationUrl,
    );
    Logger.log(
      `Authentication request against Xray Cloud response status: ${response.status}`,
      response.status === 200 ? 'DEBUG' : 'ERROR',
    );
    if (response.status === 200) {
      XrayAuthentication.status = 'AUTHENTICATED';
      XrayAuthentication.token = await response.json();
      Logger.log(
        `Authenticated against Xray Cloud. Received auth credentials for further requests:
      ${XrayAuthentication.toString()}`,
        'DEBUG',
      );
    } else throw Error('Authentication against Xray Cloud failed.');
  };

/**
 * This function ensures that the authentication token is cleared after a given time of 500ms.
 */
const clearAuthenticationToken = async () =>
  setTimeout(() => {
    XrayAuthentication.token = '';
    XrayAuthentication.status = 'UNAUTHENTICATED';
  }, 500);

/**
 *
 * @param {string} token - The authentication token to be set for the Xray Cloud API authentication.
 */
const setAuthenticationToken = async (token: string) => {
  XrayAuthentication.token = token;
  XrayAuthentication.status = 'AUTHENTICATED';
  clearAuthenticationToken();
};

/**
 * Get the authentication token from the Xray Cloud API and resets the local stored information
 * about the authentication status. After this call the authentication against the Xray API is
 * reset to clear the token inside RAM.
 * @returns {string} The stored authentication token for the Xray Cloud API.
 */
export const getAuthenticationToken = (): string => {
  const tk = XrayAuthentication.token;
  XrayAuthentication.token = '';
  XrayAuthentication.status = 'UNAUTHENTICATED';
  return tk;
};

export const XrayAuthenticationDetails = XrayAuthentication.toString;
export default {
  XrayAuthenticationDetails,
};
