import { getTestCasesForProject } from './TicketLoader';

describe('TicketLoader', () => {
  it('returns a list of jira tickets', async () => {
    // Given
    const sut = getTestCasesForProject;

    // When
    const result = await sut('BTA');

    // Then
    expect(result.length).toEqual(0);
  });

  // Gherkin definition will be downloaded from Xray, therefore {@see ../XrayClient/XrayClient.ts}
  // it.skip('downloads a feature definition for a given test case from Jira / Xray plugin', () => {
  //   const sut = downloadGherkinDefinitionOfTestCase;
  //   // expect(await sut());
  // });
});
