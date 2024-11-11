import { Comment } from 'jira.js/out/version3/models';

export type JiraComment = Comment; /**& {
  author: JiraUser;
  posted: Date;
  edited: Date;
  content: string;
  relatedJiraTicketId: JiraTicketId;
};**/
