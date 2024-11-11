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
exports.XrayAuthenticationDetails = exports.getAuthenticationToken = exports.authenticateXrayCloudApiRequest = exports.fetchAuthenticateXrayCloudApiRequest = exports.rootLevelDotenvFileExists = exports.getEnvFilePath = void 0;
const e2e_logger_1 = require("e2e-logger");
const promises_1 = require("node:fs/promises");
const dotenv = __importStar(require("dotenv"));
const _1 = require(".");
/**
 * This constant holds the URL to request against the Xray authenticate API.
 * @see https://docs.getxray.app/display/XRAYCLOUD/Authentication+-+REST+v2
 */
const xrayApiAuthenticateUrl = 'authenticate';
const XrayApiAuthenticationDetails = {
    ClientId: 'XRAY-CLIENT-ID',
    ClientSecret: 'XRAY-CLIENT-SECRET',
    toString: () => {
        var _a, _b;
        return `XrayApiAuthenticationDetails {
    ClientId: ${(_a = XrayApiAuthenticationDetails.ClientId) === null || _a === void 0 ? void 0 : _a.slice(0, 4)}*********,
    ClientSecret: ${(_b = XrayApiAuthenticationDetails.ClientSecret) === null || _b === void 0 ? void 0 : _b.slice(0, 4)}*********,
  }`;
    },
};
const envFilePath = '.env';
const getEnvFilePath = () => envFilePath;
exports.getEnvFilePath = getEnvFilePath;
const rootLevelDotenvFileExists = () => __awaiter(void 0, void 0, void 0, function* () {
    return (0, promises_1.access)((0, exports.getEnvFilePath)())
        .then(() => true)
        .catch(() => false);
});
exports.rootLevelDotenvFileExists = rootLevelDotenvFileExists;
/**
 * This function loads the Xray API authentication details from the .env file located in the root. This function does not overwrite
 * environment variables set by command line arguments and are already available by process.env.
 */
const loadXrayApiAuthenticationDetails = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    // dotenv that loads the environment variables from the .env file will only publish those variables in case they have not been
    // set by the process.env object, e.g. by command line arguments.
    e2e_logger_1.Logger.log(`DotEnv file on root level exists for selecting Xray Cloud authentication details ? ${(yield (0, exports.rootLevelDotenvFileExists)()) ? 'yes' : 'no'}`, 'DEBUG');
    if (yield (0, exports.rootLevelDotenvFileExists)()) {
        const environmentParametersAlreadyDefined = process.env.XRAY_CLIENT_ID !== undefined;
        dotenv.config({ path: (0, exports.getEnvFilePath)(), debug: true, encoding: 'utf8' });
        e2e_logger_1.Logger.log(`Loaded environment variables for Authorize against Xray Cloud, to receive an access token, from ${environmentParametersAlreadyDefined
            ? 'process environment parameters'
            : '.env file'}. Saved environment information are:` +
            `
    XRAY_CLIENT_ID: ${(_a = process.env.XRAY_CLIENT_ID) === null || _a === void 0 ? void 0 : _a.slice(0, 4)}*********${(_b = process.env.XRAY_CLIENT_ID) === null || _b === void 0 ? void 0 : _b.slice(process.env.XRAY_CLIENT_ID.length - 3)},
    XRAY_CLIENT_SECRET: ${(_c = process.env.XRAY_CLIENT_SECRET) === null || _c === void 0 ? void 0 : _c.slice(0, 4)}*********${(_d = process.env.XRAY_CLIENT_SECRET) === null || _d === void 0 ? void 0 : _d.slice(process.env.XRAY_CLIENT_SECRET.length - 3)}
    `, 'DEBUG');
    }
    XrayApiAuthenticationDetails.ClientId = process.env.XRAY_CLIENT_ID;
    XrayApiAuthenticationDetails.ClientSecret = process.env.XRAY_CLIENT_SECRET;
});
const getAuthenticationUrl = () => `${_1.xRayApiBaseUrl}/${xrayApiAuthenticateUrl}`;
const fetchAuthenticateXrayCloudApiRequest = (authenticationUrl) => __awaiter(void 0, void 0, void 0, function* () {
    return fetch(authenticationUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            client_id: XrayApiAuthenticationDetails.ClientId,
            client_secret: XrayApiAuthenticationDetails.ClientSecret,
        }),
    });
});
exports.fetchAuthenticateXrayCloudApiRequest = fetchAuthenticateXrayCloudApiRequest;
/**
 * Local object (not exported) to temporarily store the authentication information to access the
 * Xray Cloud API.
 */
const XrayAuthentication = {
    status: 'UNAUTHENTICATED',
    token: '',
    toString: () => `XrayAuthentication {
    status: ${XrayAuthentication.status},
    token: ${XrayAuthentication.token != ''
        ? XrayAuthentication.token.slice(0, 5) +
            '******' +
            XrayAuthentication.token.slice(XrayAuthentication.token.length - 5)
        : undefined}
  }`,
};
const authenticateXrayCloudApiRequest = () => __awaiter(void 0, void 0, void 0, function* () {
    yield loadXrayApiAuthenticationDetails();
    const authenticationUrl = getAuthenticationUrl();
    e2e_logger_1.Logger.log('Authenticating against Xray Cloud API ' + authenticationUrl, 'INFO');
    e2e_logger_1.Logger.log(`Using authentication details to receive access token:
    ${XrayApiAuthenticationDetails.toString()}`, 'DEBUG');
    const response = yield (0, exports.fetchAuthenticateXrayCloudApiRequest)(authenticationUrl);
    e2e_logger_1.Logger.log(`Authentication request against Xray Cloud response status: ${response.status}`, response.status === 200 ? 'DEBUG' : 'ERROR');
    if (response.status === 200) {
        XrayAuthentication.status = 'AUTHENTICATED';
        XrayAuthentication.token = yield response.json();
        e2e_logger_1.Logger.log(`Authenticated against Xray Cloud. Received auth credentials for further requests:
      ${XrayAuthentication.toString()}`, 'DEBUG');
    }
    else
        throw Error('Authentication against Xray Cloud failed.');
});
exports.authenticateXrayCloudApiRequest = authenticateXrayCloudApiRequest;
/**
 * This function ensures that the authentication token is cleared after a given time of 500ms.
 */
const clearAuthenticationToken = () => __awaiter(void 0, void 0, void 0, function* () {
    return setTimeout(() => {
        XrayAuthentication.token = '';
        XrayAuthentication.status = 'UNAUTHENTICATED';
    }, 500);
});
/**
 *
 * @param {string} token - The authentication token to be set for the Xray Cloud API authentication.
 */
const setAuthenticationToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    XrayAuthentication.token = token;
    XrayAuthentication.status = 'AUTHENTICATED';
    clearAuthenticationToken();
});
/**
 * Get the authentication token from the Xray Cloud API and resets the local stored information
 * about the authentication status. After this call the authentication against the Xray API is
 * reset to clear the token inside RAM.
 * @returns {string} The stored authentication token for the Xray Cloud API.
 */
const getAuthenticationToken = () => {
    const tk = XrayAuthentication.token;
    XrayAuthentication.token = '';
    XrayAuthentication.status = 'UNAUTHENTICATED';
    return tk;
};
exports.getAuthenticationToken = getAuthenticationToken;
exports.XrayAuthenticationDetails = XrayAuthentication.toString;
exports.default = {
    XrayAuthenticationDetails: exports.XrayAuthenticationDetails,
};
