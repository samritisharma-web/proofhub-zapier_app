'use strict';

const listSections = async (z, bundle) => {
  const response = await z.request({
    url: 'https://app.indev2.proofhub.com/oauth/ss_zapier/public/zapier/search',
    method: 'GET',
    params: {
      type: 'sections',
      workspace_id: bundle.inputData.workspace_id,
      project_id: bundle.inputData.project_id,
    },
  });
  return response.data.data.map((s) => ({ id: s.id, name: s.name }));
};

module.exports = {
  key: 'sections',
  noun: 'Section',
  list: {
    display: { label: 'New Section', description: 'Lists sections for dropdown.', hidden: true },
    operation: { perform: listSections, sample: { id: 1, name: 'Sample Section' } },
  },
};