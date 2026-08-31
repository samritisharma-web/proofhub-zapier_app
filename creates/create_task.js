'use strict';

const perform = async (z, bundle) => {
  let response;

  try {
    response = await z.request({
      url: 'https://app.indev2.proofhub.com/oauth/ss_zapier/public/zapier/action',
      method: 'POST',
      body: {
        action: 'create_task',
        wsid: bundle.inputData.wsid,
        project_id: bundle.inputData.project_id,
        title: bundle.inputData.title,
        description: bundle.inputData.description,
      },
    });
  } catch (err) {
    throw new z.errors.Error(
      `Request to ProofHub failed: ${err.message}`,
      'RequestError',
      err.status || 500
    );
  }

  if (!response || !response.status) {
    throw new z.errors.Error(
      'No response received from ProofHub.',
      'NoResponseError',
      500
    );
  }

  if (response.status >= 400) {
    throw new z.errors.Error(
      response.data?.error || 'Failed to create task.',
      'CreateTaskError',
      response.status
    );
  }

  return {
    id: `pending-${Date.now()}`,
    status: response.data.status,
    message: response.data.message,
    title: bundle.inputData.title,
    description: bundle.inputData.description,
  };
};

module.exports = {
  key: 'create_task',
  noun: 'Task',
  display: {
    label: 'Create Task',
    description: 'Create a new task in ProofHub.',
  },
  operation: {
    inputFields: [
      { key: 'wsid', label: 'Workspace', type: 'string', required: true, dynamic: 'workspacesList.id.name', altersDynamicFields: true },
      { key: 'project_id', label: 'Project', type: 'string', required: true, dynamic: 'ProjectsList.id.name' },
      { key: 'title', label: 'Task Title', type: 'string', required: true },
      { key: 'description', label: 'Description', type: 'text', required: false },
    ],
    perform,
    sample: {
      id: 'pending-sample',
      status: 'accepted',
      message: 'Task creation request received and is being processed.',
      title: 'Sample Task',
      description: 'Sample description',
    },
  },
};