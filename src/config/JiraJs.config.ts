import { Version3Client } from 'jira.js';

/* cspell:disable */
const JIRA_ACCESS_TOKEN = () =>
  process.env.JIRA_ACCESS_TOKEN ??
  'here should be a personal access token from Jira beeing set';
export const JIRA_ACCESS_USER = () =>
  process.env.JIRA_ACCESS_USER ??
  'this should be the email address of a valid Jira user';
/* cspell:enable */
const personalApiToken = JIRA_ACCESS_TOKEN();
const personalAccountEmail = JIRA_ACCESS_USER();
export const jiraClient = new Version3Client({
  host: 'https://shltm.atlassian.net',
  authentication: {
    basic: {
      username: personalAccountEmail,
      password: personalApiToken,
    },
    // oauth2: {
    //   accessToken,
    // },
  },
  noCheckAtlassianToken: false,
  strictGDPR: true,
  // middlewares: {
  //   onError: (error) => console.error(error.message),
  //   onResponse: (response) => {
  //     console.log(response);
  //     return response;
  //   },
  // },
  // baseRequestConfig: {
  // }
});
