import { Logger } from 'e2e-logger';

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { getAuthenticationToken } from './AuthenticateXrayApiAccess';

export type UploadStatusInformation<T> = {
  message: string;
  response: T;
  error?: Error;
};
const apiEndpoint =
  'https://xray.cloud.getxray.app/api/v2/import/execution/cucumber';
export const uploadTestResults: () => Promise<
  UploadStatusInformation<String | Response>
> = async () => {
  const data = readFileSync(resolve('../../cucumber-report.json'), 'utf-8');
  Logger.debug(`Length of cucumber-report.json: ${data.length}`);
  const requestAccessToken = getAuthenticationToken();
  if (requestAccessToken === '')
    throw Error(
      'Requesting Xray API to upload test results impossible. No access token available.',
    );
  Logger.info(`Pushing test results to Xray Cloud API at ${apiEndpoint}`);
  const response = await fetch(apiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${requestAccessToken}`,
    },
    body: data,
  });
  if (response.status === 200) {
    const json = await response.json();
    return {
      message: 'Test results uploaded successfully.',
      response: json,
    } as UploadStatusInformation<String>;
  } else {
    const message = `Failed to upload test results. Status: ${
      response.status
    }, ${response.statusText}: ${(await response.json()).error}`;
    Logger.error(message);
    return {
      message,
      response,
      error: new Error(message),
    } as UploadStatusInformation<Response>;
  }
};

export const changeFormatOfCucumberReportForUploadToXray: () => void = () => {
  const inputJsonReport = readFileSync(
    resolve('../../cucumber-report.json'),
    'utf-8',
  );
};
