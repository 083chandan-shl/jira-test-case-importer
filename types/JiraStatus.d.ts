export type JiraStatus = {
  label?: string;
  description?: string;
  value?: string;
  icon?: string;
  category?: object;
};

// status: {
//   self: 'https://shltm.atlassian.net/rest/api/3/status/3',
//   description: 'Dieser Vorgang wird gerade durch die zugewiesene Person bearbeitet.',
//   iconUrl: 'https://shltm.atlassian.net/images/icons/statuses/inprogress.png',
//   name: 'In Arbeit',
//   id: '3',
//   statusCategory: [Object]
// },
