const listProjects = async (z, bundle) => {
  const response = await z.request({
    url: 'https://app.indev2.proofhub.com/oauth/ss_zapier/public/zapier/search',
    method: 'GET',
    params: {
      type: 'projects',
      workspace_id: bundle.inputData.workspace_id,   // pehle field se aayega
    },
  });
  console.log('task fields',response);
  
  return response.data;
};
module.exports = {
  key: 'Projects',
  noun: 'project',
  list: {
    display: {
      label: 'New Project in resource',
      description: 'Lists projects for dropdown.',
    },
    operation: {
      perform: listProjects,
      sample: { id: 1, name: 'Sample Project' },
    },
  },
};