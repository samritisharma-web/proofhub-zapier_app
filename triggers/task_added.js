'use strict';

const handleProofHubError = (z, response) => {
  const data = response.data || {};

  // Laravel validation error
  if (response.status === 422) {
    const validationMessage =
      data.errors &&
      Object.values(data.errors)
        .flat()
        .find((message) => message);

    throw new z.errors.Error(
      validationMessage || data.message || 'Validation failed.',
      'InvalidRequest'
    );
  }

  // Other API errors
  if (response.status < 200 || response.status >= 300) {
    throw new z.errors.Error(
      data.message || 'ProofHub request failed.',
      'InvalidRequest'
    );
  }
};


const performSubscribe = async (z, bundle) => {
  const response = await z.request({
    url: 'https://app.indev2.proofhub.com/oauth/ss_zapier/public/zapier/triggers/subscribe',
    method: 'POST',

    body: {
      event: 'task_added',
      wsid: bundle.inputData.wsid,
      project_id: bundle.inputData.project_id,
      url: bundle.targetUrl,
    },

    skipThrowForStatus: true,
  });

  z.console.log('SUBSCRIBE STATUS:', response.status);
  z.console.log('SUBSCRIBE RESPONSE:', response.data);

  handleProofHubError(z, response);

  return response.data;
};


const performUnsubscribe = async (z, bundle) => {
  const subscriptionId = bundle.subscribeData.id;

  const response = await z.request({
    url:
      `https://app.indev2.proofhub.com/oauth/ss_zapier/public/zapier/triggers/subscribe/${subscriptionId}`,

    method: 'DELETE',

    skipThrowForStatus: true,
  });

  z.console.log('UNSUBSCRIBE STATUS:', response.status);
  z.console.log('UNSUBSCRIBE RESPONSE:', response.data);

  handleProofHubError(z, response);

  return response.data;
};


const shapeTask = (task) => ({
  id: task.id != null ? String(task.id) : undefined,
  name: task.name,
  description: task.description,
  wsid: task.wsid != null ? String(task.wsid) : undefined,
  project_id: task.project_id != null ? String(task.project_id) : undefined,
});


const perform = async (z, bundle) => {
  return [shapeTask(bundle.cleanedRequest || {})];
};


const performList = async (z, bundle) => {
  const response = await z.request({
    // your actual URL/config here
    // url: '...',
    // method: 'GET',
    // params: { ... },

    skipThrowForStatus: true,
  });

  z.console.log('LIST STATUS:', response.status);
  z.console.log('LIST RESPONSE:', response.data);

  handleProofHubError(z, response);

  const data = response.data;

  const list = Array.isArray(data)
    ? data
    : data.data || data.original || [];

  return list.map(shapeTask);
};


module.exports = {

  key: 'task_added',

  noun: 'Task',

  display: {
    label: 'Task Added',
    description:
      'Triggers instantly when a new task is added in ProofHub.',
  },

  operation: {

    type: 'hook',

    inputFields: [
      {
        key: 'wsid',
        label: 'Workspace',
        type: 'string',
        required: true,
        dynamic: 'workspacesList.id.name',
        altersDynamicFields: true,
      },

      {
        key: 'project_id',
        label: 'Project',
        type: 'string',
        required: true,
        dynamic: 'ProjectsList.id.name',
      },
    ],

    performSubscribe,

    performUnsubscribe,

    perform,

    performList,

    sample: {
      id: '101416',
      name: 'Sample Task',
      description: 'Sample task',
      wsid: '4598',
      project_id: '36290',
    },

    outputFields: [
      {
        key: 'id',
        label: 'Task ID',
        type: 'string',
      },
      {
        key: 'name',
        label: 'Task Name',
        type: 'string',
      },
      {
        key: 'description',
        label: 'Description',
        type: 'string',
      },
      {
        key: 'wsid',
        label: 'Workspace ID',
        type: 'string',
      },
      {
        key: 'project_id',
        label: 'Project ID',
        type: 'string',
      },
    ],
  },
};