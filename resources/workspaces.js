'use strict';

const listWorkspaces = async (z, bundle) => {
  const response = await z.request({
    url: 'https://app.indev2.proofhub.com/oauth/ss_zapier/public/zapier/search',
    method: 'GET',
    params: {
      type: 'workspaces',
    },
  });

  response.throwForStatus();

  const workspaces =
    response.data.original ||
    response.data.data ||
    response.data;

  return workspaces.map((ws) => ({
    id: String(ws.wsid),
    name: ws.name,
  }));
};

module.exports = {
  key: 'workspaces',

  noun: 'Workspace',

  list: {
    display: {
      label: 'New Workspace',
      description: 'Triggers when a new workspace is found.',
      hidden: true,
    },

    operation: {
      perform: listWorkspaces,

      sample: {
        id: '609755230109',
        name: 'Sample Workspace',
      },
    },
  },
};