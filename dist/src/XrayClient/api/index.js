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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.xRayApiBaseUrl = exports.xrayApiVersion = void 0;
__exportStar(require("./ExportingCucumberTests"), exports);
__exportStar(require("./UploadTestResults"), exports);
__exportStar(require("./AuthenticateXrayApiAccess"), exports);
/**
 * This constant holds the version of the Xray Cloud API that is going to be used. It will be included inside the
 * constant {@constant xRayApiBaseUrl} to form the base URL for the respective API requests.
 * @see https://docs.getxray.app/display/XRAYCLOUD/REST+API - For available versions. Currently only "v1" and "v2"
 *  are supported.
 */
exports.xrayApiVersion = 'v2';
/**
 * This constant holds the base URL of the Xray Cloud API. This constant will be expanded for
 * the respective API requests that is going to be made.
 * @see https://docs.getxray.app/display/XRAYCLOUD/REST+API
 */
exports.xRayApiBaseUrl = `https://xray.cloud.getxray.app/api/${exports.xrayApiVersion}`;
