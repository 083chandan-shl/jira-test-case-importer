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
exports.changeFormatOfCucumberReportForUploadToXray = exports.uploadTestResults = void 0;
const e2e_logger_1 = require("e2e-logger");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const AuthenticateXrayApiAccess_1 = require("./AuthenticateXrayApiAccess");
const apiEndpoint = 'https://xray.cloud.getxray.app/api/v2/import/execution/cucumber';
const uploadTestResults = () => __awaiter(void 0, void 0, void 0, function* () {
    const data = (0, node_fs_1.readFileSync)((0, node_path_1.resolve)('../../cucumber-report.json'), 'utf-8');
    e2e_logger_1.Logger.debug(`Length of cucumber-report.json: ${data.length}`);
    const requestAccessToken = (0, AuthenticateXrayApiAccess_1.getAuthenticationToken)();
    if (requestAccessToken === '')
        throw Error('Requesting Xray API to upload test results impossible. No access token available.');
    e2e_logger_1.Logger.info(`Pushing test results to Xray Cloud API at ${apiEndpoint}`);
    const response = yield fetch(apiEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${requestAccessToken}`,
        },
        body: data,
    });
    if (response.status === 200) {
        const json = yield response.json();
        return {
            message: 'Test results uploaded successfully.',
            response: json,
        };
    }
    else {
        const message = `Failed to upload test results. Status: ${response.status}, ${response.statusText}: ${(yield response.json()).error}`;
        e2e_logger_1.Logger.error(message);
        return {
            message,
            response,
            error: new Error(message),
        };
    }
});
exports.uploadTestResults = uploadTestResults;
const changeFormatOfCucumberReportForUploadToXray = () => {
    const inputJsonReport = (0, node_fs_1.readFileSync)((0, node_path_1.resolve)('../../cucumber-report.json'), 'utf-8');
};
exports.changeFormatOfCucumberReportForUploadToXray = changeFormatOfCucumberReportForUploadToXray;
