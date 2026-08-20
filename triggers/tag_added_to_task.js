'use strict';

const perform = async (z, bundle) => {
  let response;

  try {
    response = await z.request({
      url: 'https://app.indev2.proofhub.com/oauth/ss_zapier/public/zapier/trigger',
      method: 'POST',

      body: {
        event: 'tag_added_to_task',

        workspace_id: bundle.inputData.workspace_id,
        project_id: bundle.inputData.project_id,
        task_id: bundle.inputData.task_id,
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
      response.data?.error || 'Failed to get task event from ProofHub.',
      'TaskcompletedError',
      response.status
    );
  }

  /*
   * Zapier polling triggers expect an array of records.
   *
   * Example:
   * [
   *   {
   *     id: 101416,
   *     name: "My New Task",
   *     workspace_id: 4598,
   *     project_id: 36290
   *   }
   * ]
   */

  const data = response.data;

  if (Array.isArray(data)) {
    return data.map(item => ({
      ...item,
      id: String(item.id),
    }));
  }

  if (Array.isArray(data.data)) {
    return data.data.map(item => ({
      ...item,
      id: String(item.id),
    }));
  }

  if (data.data) {
    return [{
      ...data.data,
      id: String(data.data.id),
    }];
  }

  return [];
};

module.exports = {
  key: 'tag_added_to_task',

  noun: 'Task',

  display: {
    label: 'Task completed',
    description: 'Triggers when a new task is completed in ProofHub.',
  },

  operation: {
    type: 'polling',

    inputFields: [
      {
        key: 'workspace_id',
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

        altersDynamicFields: true,
      },

      {
        key: 'task_id',
        label: 'Task',
        type: 'string',
        required: false,

        dynamic: 'TasksList.id.name',
      },
    ],

    perform,

    sample: {
      id: '101416',
      name: 'Sample Task',
      workspace_id: '4598',
      project_id: '36290',
      task_id: '101416',
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
        key: 'workspace_id',
        label: 'Workspace ID',
        type: 'string',
      },
      {
        key: 'project_id',
        label: 'Project ID',
        type: 'string',
      },
      {
        key: 'task_id',
        label: 'Task ID',
        type: 'string',
      },
    ],
  },
};