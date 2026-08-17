'use strict';

const listTags = async (z, bundle) => {
  const response = await z.request({
    url: 'https://app.indev2.proofhub.com/oauth/ss_zapier/public/zapier/search',
    method: 'GET',
    params: {
      type: 'tags',
      workspace_id: bundle.inputData.workspace_id,
    },
  });
  return response.data.data.map((t) => ({ id: t.id, name: t.name }));
};

module.exports = {
  key: 'tags',
  noun: 'Tag',
  list: {
    display: { label: 'New Tag', description: 'Lists tags for dropdown.', hidden: true },
    operation: { perform: listTags, sample: { id: 1, name: 'Sample Tag' } },
  },
};