'use strict';

const performSubscribe = async (z, bundle) => {

  const response = await z.request({
    url: 'https://app.indev2.proofhub.com/oauth/ss_zapier/public/zapier/triggers/subscribe',

    method: 'POST',

    body: {
      event: 'task_added',

      workspace_id: bundle.inputData.workspace_id,

      project_id: bundle.inputData.project_id,

      url: bundle.targetUrl,
    },
  });

  response.throwForStatus();

  return response.data;
};


const performUnsubscribe = async (z, bundle) => {

  const subscriptionId = bundle.subscribeData.id;

  const response = await z.request({
    url:
      `https://app.indev2.proofhub.com/oauth/ss_zapier/public/zapier/triggers/subscribe/${subscriptionId}`,

    method: 'DELETE',
  });

  response.throwForStatus();

  return response.data;
};


const perform = async (z, bundle) => {

  /*
   * IMPORTANT:
   *
   * ProofHub has already POSTed the event to Zapier.
   *
   * We don't call ProofHub here.
   */

  const task = bundle.cleanedRequest;

  return {
    id: String(task.id),
    name: task.name,
    description: task.description,
    workspace_id: String(task.workspace_id),
    project_id: String(task.project_id),
  };
};


const performList = async (z, bundle) => {

  const response = await z.request({
    url:
      'https://app.indev2.proofhub.com/oauth/ss_zapier/public/zapier/triggers/sample',

    method: 'GET',

    params: {
      event: 'task_added',
      workspace_id: bundle.inputData.workspace_id,
      project_id: bundle.inputData.project_id,
    },
  });

  response.throwForStatus();

  const data = response.data;

  return Array.isArray(data)
    ? data
    : data.data || [];
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
      { key: 'workspace_id', label: 'Workspace', type: 'string', required: true, dynamic: 'workspacesList.id.name', altersDynamicFields: true },
      { key: 'project_id', label: 'Project', type: 'string', required: true, dynamic: 'ProjectsList.id.name' },

    ],

    performSubscribe,

    performUnsubscribe,

    perform,

    performList,

    sample: {

      id: '101416',

      name: 'Sample Task',

      description: 'Sample task',

      workspace_id: '4598',

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
        key: 'workspace_id',
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