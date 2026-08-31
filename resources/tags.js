'use strict';

const listTags = async (z, bundle) => {
  const response = await z.request({
    url: 'https://app.indev2.proofhub.com/oauth/ss_zapier/public/zapier/search',
    method: 'GET',
    params: {
      type: 'tags',
      wsid: bundle.inputData.wsid,
      project_id: bundle.inputData.project_id,
      task_id: bundle.inputData.task_id,
    },
  });

  return response.data.original.data.map((tag) => ({
    id: String(tag.id),
    name: tag.name,
  }));
};

module.exports = {
  key: 'tags',
  noun: 'Tag',

  list: {
    display: {
      label: 'New Tag',
      description: 'Lists tags for dropdown.',
      hidden: true,
    },

    operation: {
      perform: listTags,

      sample: {
        id: '1',
        name: 'Sample Tag',
      },
    },
  },
};