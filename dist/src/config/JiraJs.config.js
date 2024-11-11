"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jiraClient = exports.JIRA_ACCESS_USER = void 0;
const jira_js_1 = require("jira.js");
/* cspell:disable */
const JIRA_ACCESS_TOKEN = () => {
    var _a;
    return (_a = process.env.JIRA_ACCESS_TOKEN) !== null && _a !== void 0 ? _a : 'here should be a personal access token from Jira beeing set';
};
const JIRA_ACCESS_USER = () => {
    var _a;
    return (_a = process.env.JIRA_ACCESS_USER) !== null && _a !== void 0 ? _a : 'this should be the email address of a valid Jira user';
};
exports.JIRA_ACCESS_USER = JIRA_ACCESS_USER;
/* cspell:enable */
const personalApiToken = JIRA_ACCESS_TOKEN();
const personalAccountEmail = (0, exports.JIRA_ACCESS_USER)();
exports.jiraClient = new jira_js_1.Version3Client({
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
