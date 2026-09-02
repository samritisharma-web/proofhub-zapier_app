'use strict';

const performSubscribe = async (z, bundle) => {
  z.console.log('===== SUBSCRIBE CALLED (updated_task) =====');
  z.console.log('INPUT DATA:', bundle.inputData);
  z.console.log('TARGET URL:', bundle.targetUrl);

  const response = await z.request({
    url: 'https://app.indev2.proofhub.com/oauth/ss_zapier/public/zapier/triggers/subscribe',
    method: 'POST',
    body: {
      event: 'updated_task',
      wsid: bundle.inputData.wsid,
      project_id: bundle.inputData.project_id,
      task_id: bundle.inputData.task_id,
      task_fields: bundle.inputData.taskFields,
      url: bundle.targetUrl,
    },
  });

  z.console.log('SUBSCRIBE RESPONSE:', response.data);
  response.throwForStatus();
  return response.data;
};

const performUnsubscribe = async (z, bundle) => {
  const subscriptionId = bundle.subscribeData.id;

  const response = await z.request({
    url: `https://app.indev2.proofhub.com/oauth/ss_zapier/public/zapier/triggers/subscribe/${subscriptionId}`,
    method: 'DELETE',
  });

  response.throwForStatus();
  return response.data;
};

const shapeTask = (task = {}) => {
  const item = task.item_json || task;
  const rawId = task.item_id != null ? task.item_id : task.id;
  const rawWsid = task.wsid != null ? task.wsid : task.ws_id;
  const updatedAt = task.last_activity_at || task.updated_at || Date.now();

  return {
    id: rawId != null ? `${rawId}-${updatedAt}` : undefined,  // <-- unique per update
    name: item.name || (rawId != null ? `Task #${rawId}` : undefined),
    description: item.description,
    wsid: rawWsid != null ? String(rawWsid) : undefined,
    project_id: task.project_id != null ? String(task.project_id) : undefined,
    updated_at: updatedAt,
  };
};

const perform = async (z, bundle) => {
  const task = bundle.cleanedRequest || {};

  z.console.log('===== TASK UPDATED =====');
  z.console.log('Raw task payload:', task);

  const shaped = shapeTask(task);

  z.console.log('Shaped output:', shaped);

  return [shaped];
};

const performList = async (z, bundle) => {
  const response = await z.request({
    url: 'https://app.indev2.proofhub.com/oauth/ss_zapier/public/zapier/triggers',
    method: 'GET',
    params: {
      event: 'updated_task',
      wsid: bundle.inputData.wsid,
      project_id: bundle.inputData.project_id,
      task_id: bundle.inputData.task_id,
      task_fields: bundle.inputData.taskFields,
    },
    skipThrowForStatus: true,
  });

  z.console.log('STATUS:', response.status);
  z.console.log('RESPONSE DATA:', response.data);

  if (response.status === 422) {
    const message =
      response.data?.errors?.event?.[0] ||
      response.data?.message ||
      'Validation failed.';

    throw new z.errors.Error(
      message,
      'InvalidRequest'
    );
  }

  if (response.status < 200 || response.status >= 300) {
    throw new z.errors.Error(
      response.data?.message || 'Unable to pull tasks.',
      'InvalidRequest'
    );
  }

  const data = response.data;

  const list = Array.isArray(data)
    ? data
    : data.data || data.original || [];

  return list.map(shapeTask);
};

module.exports = {
  key: 'updated_task',
  noun: 'Task',

  display: {
    label: 'Task Updated',
    description: 'Triggers instantly when a task is updated in ProofHub.',
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
        altersDynamicFields: true,
      },
      {
        key: 'task_id',
        label: 'Task',
        type: 'string',
        required: true,
        dynamic: 'tasksList.id.name',
        altersDynamicFields: true,
      },
      {
        key: 'taskFields',
        label: 'Task Fields',
        type: 'string',
        list: true,
        required: true,
        dynamic: 'taskFields.id.name',
      },
    ],

    performSubscribe,
    performUnsubscribe,
    perform,
    performList,

    sample: {
      id: '111988',
      name: 'Task #111988',
      description: 'Sample description',
      wsid: '4598',
      project_id: '36290',
      updated_at: '2026-08-26T09:34:57.640589Z',
    },

    outputFields: [
      { key: 'id', label: 'Task ID', type: 'string' },
      { key: 'name', label: 'Task Name', type: 'string' },
      { key: 'description', label: 'Description', type: 'string' },
      { key: 'wsid', label: 'Workspace ID', type: 'string' },
      { key: 'project_id', label: 'Project ID', type: 'string' },
      { key: 'updated_at', label: 'Updated At', type: 'datetime' },
    ],
  },
};
