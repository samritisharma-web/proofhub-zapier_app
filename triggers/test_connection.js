const perform = async (z, bundle) => {
  const response = await z.request({
    url: 'https://app.indev2.proofhub.com/oauth/ss_zapier/public/me',
  });

  return [response.data];
};

module.exports = {
  key: 'test_connection',
  noun: 'Workspace',

  display: {
    label: 'Test Connection',
    description: 'Tests ProofHub connection',
  },

  operation: {
    perform,
    sample: {
      workspace_id: 1,
      workspace_name: 'Demo',
    },
  },
};