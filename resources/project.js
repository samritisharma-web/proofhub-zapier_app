const listProjects = async (z, bundle) => {
  const response = await z.request({
    url: 'https://app.indev2.proofhub.com/oauth/ss_zapier/public/zapier/search',
    method: 'GET',
    params: {
      type: 'projects',
      wsid: bundle.inputData.wsid,
    },
  });

  const projects =
    response.data.original ||
    response.data.data ||
    response.data;

  return projects.map((pr) => ({
    id: String(pr.id),
    name: pr.name,
  }));
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