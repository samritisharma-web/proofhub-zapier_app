'use strict';

const listUsers = async (z, bundle) => {
  const response = await z.request({
    url: 'https://app.indev2.proofhub.com/oauth/ss_zapier/public/zapier/search',
    method: 'GET',
    params: {
      type: 'users',
      workspace_id: bundle.inputData.workspace_id,
    },
  });
  return response.data.data.map((u) => ({ id: u.id, name: u.name || u.email }));
};

module.exports = {
  key: 'users',
  noun: 'User',
  list: {
    display: { label: 'New User', description: 'Lists workspace users for dropdown.', hidden: true },
    operation: { perform: listUsers, sample: { id: 1, name: 'Sample User' } },
  },
};