const perform = async (z, bundle) => {
    const response = await z.request({
        url: 'https://app.indev2.proofhub.com/oauth/ss_zapier/public/zapier/search',
        params: { type: 'workspace', workspace_id: bundle.inputData.workspace_id },
    });
    return response.data;
};

module.exports = {
    key: 'workspace',
    noun: 'workspace',
    display: {
        label: 'New Workspace',
        description: 'Used internally for dropdown.',
        hidden: true,
    },
    operation: { perform, sample: { id: 1, name: 'Sample workspace' } },
};