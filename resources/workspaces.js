'use strict';

const listWorkspaces = async (z, bundle) => {
  const response = await z.request({
    url: 'https://app.indev2.proofhub.com/oauth/ss_zapier/public/zapier/search',
    method: 'GET',
    params: { type: 'workspaces' },
  });

  // backend response: { "status-code": 200, "success": true, "data": [...] }
  // Zapier ko seedha array chahiye:
  return response.data.data.map((ws) => ({
    id: ws.id,
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
      sample: { id: 1, name: 'Sample Workspace' },
    },
  },
};