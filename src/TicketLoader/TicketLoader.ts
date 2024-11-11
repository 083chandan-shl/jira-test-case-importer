import { Logger } from 'e2e-logger';
import { projectFilter } from '../../index';
import { JiraTestCase } from '../../types';
import { JIRA_ACCESS_USER, jiraClient as jira } from '../config/JiraJs.config';
import { Comment } from 'jira.js/out/version3/models/comment';

export const getTestCasesForProject: (
  project: string,
) => Promise<JiraTestCase[]> = async (project) => {
  // if (
  //   projectFilter !== undefined &&
  //   projectFilter !== '' &&
  //   project !== projectFilter
  // )
  // TODO: Rework filter what projects are allowed / filter needed?
  //   throw Error(
  //     `A filter to requests Jira stories from has been set. The value ${project} does not match the accepted project filter for ${projectFilter}.`,
  //   );
  // TODO: Demo dieses einen TF entfernen
  // await jira.issues.getIssue({ issueIdOrKey: 'BTA-837' }, (err, data?) => {
  //   if (err) console.error(err);
  //   if (data) {
  //     return {
  //       id: data.fields.id,
  //       key: data.fields.key,
  //       project: data.fields.project,
  //       summary: data.fields.summary,
  //       description: data.fields.description,
  //       comments: data.fields.comment.comments,
  //       creator: {
  //         emailAddress: data.fields.creator.emailAddress,
  //         displayName: data.fields.creator.displayName,
  //         url: data.fields.creator.self,
  //       },
  //       url: data.fields.self,
  //       created: new Date(data.fields.created),
  //       status: {
  //         label: data.fields.status.name,
  //         description: data.fields.status.description,
  //         value: data.fields.status.id,
  //         icon: data.fields.status.iconUrl,
  //         category: data.fields.status.statusCategory,
  //       },
  //       assignee: data.fields.reporter,
  //       gherkinScenario: {
  //         feature: '',
  //         scenario: '',
  //         tags: [],
  //       },
  //     } as JiraTestCase;
  //   }
  //   throw Error('getIssue() request not processed');
  // });
  try {
    Logger.log(
      `Authenticate against Jira instance ${
        (await jira.serverInfo.getServerInfo()).baseUrl
      } with user ${JIRA_ACCESS_USER()}`,
      'INFO',
    );
    jira.myself.getCurrentUser();
  } catch (err: any) {
    Logger.log(`Authentication against Jira failed.`, 'ERROR', err);
    throw err;
  }
  const jqlSearchResults = await jira.issueSearch.searchForIssuesUsingJql({
    jql: `project = ${project} AND type = Test AND status not in (Closed, Rejected) AND testType = Cucumber`,
  });
  // console.log(jqlSearchResults);
  let ticketsForDownload = '';
  const jiraTestCasesToDownloadFromXrayCloud: JiraTestCase[] = [];
  jqlSearchResults.issues?.forEach((jiraIssue, index) => {
    // console.log(`# ${index} Jira issue ${jiraIssue.id}: ${jiraIssue.key}`);
    const { key, fields, self } = jiraIssue;
    const project: string = key.split('-')[0];
    const id: number = Number.parseInt(key.split('-')[1]);
    const { summary, comment, creator, assignee, status, created } = fields;
    const description: {
      version?: number;
      type?: string;
      content?: Omit<any, 'version'>[];
    } = {
      version: fields.description?.version,
      type: fields.description?.type,
      content: fields.description?.content,
    };
    const comments: Comment[] | undefined = comment
      ? comment.comments
      : undefined;

    jiraTestCasesToDownloadFromXrayCloud.push({
      id: { project, id },
      key,
      project: {
        id: fields.project.id,
        url: fields.project.self,
        name: fields.project.name,
        key: fields.project.key,
      },
      summary,
      description,
      url: self || undefined,
      comments,
      creator,
      assignee,
      status,
      created: new Date(created),
    });
    ticketsForDownload += `${jiraIssue.key}`;
    if (jqlSearchResults.issues && index + 1 < jqlSearchResults.issues.length)
      ticketsForDownload += ', ';
  });
  Logger.log(
    `Found ${jqlSearchResults.issues?.length} test cases for download: ${ticketsForDownload}`,
    'INFO',
  );
  return jiraTestCasesToDownloadFromXrayCloud;
};

// export const downloadGherkinDefinitionOfTestCase: (
//   TestCaseKey: JiraTestCase,
// ) => Promise<string> = async (testCase) => {
//   // jira.

//   return '';
// };

export default {
  getTestCasesForProject,
};
