import {
  GherkinScenario,
  JiraUser,
  JiraComment,
  JiraStatus,
  JiraTicketId,
} from './';

export type JiraTestCase = {
  id: JiraTicketId;
  key: string;
  project: { url: string; id: string; name: string; key: string };
  summary: string;
  description?: {
    version?: number;
    type?: string;
    content?: Omit<any, 'version'>[];
  };
  comments?: JiraComment[];
  gherkinScenario?: GherkinScenario;
  creator: JiraUser;
  assignee: JiraUser;
  status: JiraStatus;
  url?: string;
  created: Date;
};
