const perform = async (z, bundle) => {
  const response = await z.request({
    url: 'https://app.indev2.proofhub.com/oauth/ss_zapier/public/zapier/search',
    params: { type: 'projects', workspace_id: bundle.inputData.workspace_id },
  });
  return response.data;
};

module.exports = {
  key: 'project',
  noun: 'Project',
  display: { label: 'New Project in trigger', description: 'Triggers when a new project is found.', hidden: true },
  operation: { perform, sample: { id: 1, name: 'Sample Project' } },
};