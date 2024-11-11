import { Logger } from 'e2e-logger';

import rewire from 'rewire';

import {
  AuthenticationResult,
  downloadCucumberTests,
  fetchAuthenticateXrayCloudApiRequest,
  getEnvFilePath,
  rootLevelDotenvFileExists,
} from '../ExportingCucumberTests';

describe('ExportingCucumberTests', () => {
  describe.skip('access .env file', () => {
    // beforeAll(() => {
    // TODO: Jest mock does not mock partials
    jest.mock('./ExportingCucumberTests', () => {
      const originalModule = jest.requireActual('../foo-bar-baz');
      return {
        __esModule: true,
        ...originalModule,
        envFilePath: '../../.env',
        getEnvFilePath: () => '../../.env',
        rootLevelDotenvFileExists: () => true,
      };
    });
    // });
    it('should access project root level .env file', async () => {
      // Given
      const sut = rootLevelDotenvFileExists;
      // When
      const result = await sut();
      Logger.log(`Root level .env file exists ? ${result}`, 'DEBUG');
      // Then
      expect(result).toBe(true);
    });
  });
  describe('authentication details preparation for request', () => {
    // stored are Authentication Details (used to authetnicate against Xray Cloud API)
    // and authentication result (the auth token): XrayAuthentication
    describe('clearAuthenticationToken', () => {
      it('clears stored authentication details', () => {
        // Given
        // const XrayAuthenticationDetails;
      });
    });

    it.skip('should use configuration properties from process.env in case no .env file is available', () => {
      // prepare rewire mock
      const rewireExportingCucumberTests = rewire(
        '../../../dist/src/XrayClient/api/ExportingCucumberTests',
      );
      expect(rewireExportingCucumberTests).toBeDefined();
      const loadXrayApiAuthenticationDetails =
        rewireExportingCucumberTests.__get__(
          'loadXrayApiAuthenticationDetails',
        );
      expect(loadXrayApiAuthenticationDetails).toBeDefined();
      const xrayApiAuthenticationDetails = rewireExportingCucumberTests.__get__(
        'XrayApiAuthenticationDetails',
      );
      expect(xrayApiAuthenticationDetails).toBeDefined();
      // save current environment before test
      const oldEnv = process.env;
      // Given
      process.env.XRAY_CLIENT_ID = 'Expected result'; // TODO: in jest test the value is not rewritten when tests are started with env parameter set (e.g. `XRAY_CLIENT_ID=123client npm run test`), why?
      jest.mock('./ExportingCucumberTests', () => {
        // eslint-disable-next-line no-unused-labels
        getEnvFilePath: () => '/this/is/a/fake/path/.env';
      });
      const sut = loadXrayApiAuthenticationDetails;
      // When
      expect(sut).not.toThrow();
      console.log(xrayApiAuthenticationDetails);
      // Then
      expect(process.env.XRAY_CLIENT_ID).toEqual('Expected result');
      expect(xrayApiAuthenticationDetails.XRAY_CLIENT_ID).toEqual(
        'Expected result',
      );
      // restore original environment before test
      process.env = oldEnv;
    });
  });
  describe('getAuthenticationUrl', () => {
    it('returns string', () => {
      // rewire getAuthenticationUrl
      const getAuthenticationUrl = rewire(
        '../../../dist/src/XrayClient/api/ExportingCucumberTests',
      ).__get__('getAuthenticationUrl');
      // Given
      const sut = getAuthenticationUrl;
      // When
      const result = sut();
      // Then
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(1);
    });
  });
  describe('fetchAuthenticateXrayCloudApiRequest', () => {
    it('should return 200 with valid credentials', async () => {
      // rewire getAuthenticationUrl
      const getAuthenticationUrl = rewire(
        '../../../dist/src/XrayClient/api/ExportingCucumberTests',
      ).__get__('getAuthenticationUrl');
      // Given
      const sut = fetchAuthenticateXrayCloudApiRequest;
      // When
      const response = await sut(getAuthenticationUrl());
      // Then
      expect(response.status).toBe(200);
    });
  });
  describe('authenticateXrayCloudApiRequest', () => {
    it('should authenticate successfully against Xray Cloud API', async () => {
      // avoid console output of tested error; INFO: these two lines turn of logging at all
      const loggerRewire = rewire('../../../../logger/dist/src/logger/Logger');
      const Logger = loggerRewire.__get__('Logger');
      jest.spyOn(Logger, 'log').mockImplementation(() => {});
      const console = loggerRewire.__get__('console');
      jest.spyOn(console, 'log').mockImplementation(() => {});
      // Given
      const exportingCucumberTestsRewire = rewire(
        '../../../dist/src/XrayClient/api/ExportingCucumberTests',
      );
      const XrayAuthentication: {
        status: AuthenticationResult;
        token: string;
      } = exportingCucumberTestsRewire.__get__('XrayAuthentication');
      const authenticateXrayCloudApiRequest =
        exportingCucumberTestsRewire.__get__('authenticateXrayCloudApiRequest');
      const sut = authenticateXrayCloudApiRequest;
      // When
      expect(await sut()).not.toThrow;
      const result = JSON.stringify(XrayAuthentication.token).replace(/"/g, '');
      // Then
      expect(result).toBeDefined();
      expect(result).not.toEqual(
        `{error:Authentication failed. Invalid client credentials!}`,
      );
      expect(result.length).toBeGreaterThan(1);
    });

    it.skip('should fail authentication request with response code 401 if the Xray license is expired', async () => {
      // test has to be defined
    });
    it.skip('should fail authentication request with response code 404 if the Xray API URL is invalid configured', async () => {
      // test has to be defined
    });
    it.skip('should fail authentication request with response code 500 if an internal error occurs in Xray Cloud API', async () => {
      // test has to be defined
    });
  });
  describe('downloadCucumberTests', () => {
    it('throws an error if api authentication has not been processed in advance', () => {
      // avoid console output of tested error
      jest.spyOn(Logger, 'log').mockImplementation(() => {});
      // Given
      const sut = downloadCucumberTests;
      // When
      expect(sut).rejects.toThrow(
        'Xray API access not authenticated. Authorize API access before downloading feature files.',
      );
    });
  });
});
