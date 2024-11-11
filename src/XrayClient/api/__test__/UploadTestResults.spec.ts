import Ajv, { DefinedError } from 'ajv';

import { access, constants } from 'node:fs/promises';

import { Logger } from 'e2e-logger';

import addFormats from 'ajv-formats';

import { resolve } from 'node:path';

import { authenticateXrayCloudApiRequest } from '../AuthenticateXrayApiAccess';
import {
  UploadStatusInformation,
  uploadTestResults,
} from '../UploadTestResults';

import schema from './fixtures/XrayApiUploadTestResults.api-schema.json';
import testExecutionReportFixture from './fixtures/cucumber-report.json';

describe('JSON Schema Validation', () => {
  let ajv: Ajv;

  beforeAll(() => {
    // setup Ajv
    ajv = new Ajv({
      verbose: true,
      allErrors: true,
      logger: {
        log: console.log.bind(Logger.log),
        warn: console.warn.bind(Logger.warn),
        error: console.error.bind(Logger.error),
      },
    });
    addFormats(ajv); // add types like date-time, email, etc. to scheme validation of Ajv
  });

  it('should validate the JSON file against the schema', () => {
    const validate = ajv.compile(schema);
    const isValid = validate(testExecutionReportFixture);
    if (
      typeof validate.errors === 'object' &&
      (validate.errors as DefinedError[]).length > 0
    ) {
      // only necessary for debugging test results
      for (const err of validate.errors as DefinedError[]) {
        Logger.error(err);
      }
    }
    expect(isValid).toBe(true);
  });

  it('should fail validation if the JSON file contains an invalid property', () => {
    const invalidFixture = {
      ...testExecutionReportFixture,
      invalidProperty: 'test',
    };
    const validate = ajv.compile(schema);
    const isValid = validate(invalidFixture);
    expect(isValid).toBe(false);
  });
});
describe('Upload test results functionality', () => {
  it.only('should upload test execution result successfully', async () => {
    // Given
    const authorizeRequest = authenticateXrayCloudApiRequest;
    const sut = uploadTestResults;
    expect(
      access(
        resolve(`${__dirname}/fixtures/cucumber-report.json`),
        constants.R_OK,
      ),
    );
    // When
    await authorizeRequest();
    const response: UploadStatusInformation<any> = await sut();
    // Then
    expect(response).toBeDefined();
    expect(response.message).toBe('Test results uploaded successfully.');
    expect(response.response.status).toBe(200);
    expect(response.error).toBeUndefined();
  }, 60000);
});
