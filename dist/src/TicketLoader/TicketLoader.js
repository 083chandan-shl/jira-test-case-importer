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
exports.getTestCasesForProject = void 0;
const e2e_logger_1 = require("e2e-logger");
const JiraJs_config_1 = require("../config/JiraJs.config");
const getTestCasesForProject = (project) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
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
        e2e_logger_1.Logger.log(`Authenticate against Jira instance ${(yield JiraJs_config_1.jiraClient.serverInfo.getServerInfo()).baseUrl} with user ${(0, JiraJs_config_1.JIRA_ACCESS_USER)()}`, 'INFO');
        JiraJs_config_1.jiraClient.myself.getCurrentUser();
    }
    catch (err) {
        e2e_logger_1.Logger.log(`Authentication against Jira failed.`, 'ERROR', err);
        throw err;
    }
    const jqlSearchResults = yield JiraJs_config_1.jiraClient.issueSearch.searchForIssuesUsingJql({
        jql: `project = ${project} AND type = Test AND status not in (Closed, Rejected) AND testType = Cucumber`,
    });
    // console.log(jqlSearchResults);
    let ticketsForDownload = '';
    const jiraTestCasesToDownloadFromXrayCloud = [];
    (_a = jqlSearchResults.issues) === null || _a === void 0 ? void 0 : _a.forEach((jiraIssue, index) => {
        var _a, _b, _c;
        // console.log(`# ${index} Jira issue ${jiraIssue.id}: ${jiraIssue.key}`);
        const { key, fields, self } = jiraIssue;
        const project = key.split('-')[0];
        const id = Number.parseInt(key.split('-')[1]);
        const { summary, comment, creator, assignee, status, created } = fields;
        const description = {
            version: (_a = fields.description) === null || _a === void 0 ? void 0 : _a.version,
            type: (_b = fields.description) === null || _b === void 0 ? void 0 : _b.type,
            content: (_c = fields.description) === null || _c === void 0 ? void 0 : _c.content,
        };
        const comments = comment
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
    e2e_logger_1.Logger.log(`Found ${(_b = jqlSearchResults.issues) === null || _b === void 0 ? void 0 : _b.length} test cases for download: ${ticketsForDownload}`, 'INFO');
    return jiraTestCasesToDownloadFromXrayCloud;
});
exports.getTestCasesForProject = getTestCasesForProject;
// export const downloadGherkinDefinitionOfTestCase: (
//   TestCaseKey: JiraTestCase,
// ) => Promise<string> = async (testCase) => {
//   // jira.
//   return '';
// };
exports.default = {
    getTestCasesForProject: exports.getTestCasesForProject,
};
