'use strict';

const performSubscribe = async (z, bundle) => {
  z.console.log('===== TASK COMPLETED SUBSCRIBE CALLED =====');
  z.console.log('INPUT DATA:', bundle.inputData);
  z.console.log('TARGET URL:', bundle.targetUrl);

  const response = await z.request({
    url: 'https://app.indev2.proofhub.com/oauth/ss_zapier/public/zapier/triggers/subscribe',
    method: 'POST',
    body: {
      event: 'completed_task',
      wsid: bundle.inputData.wsid,
      project_id: bundle.inputData.project_id,
      url: bundle.targetUrl,
    },
  });

  z.console.log('TASK COMPLETED SUBSCRIBE RESPONSE:', response.data);
  response.throwForStatus();
  return response.data;
};

const performUnsubscribe = async (z, bundle) => {
  const subscriptionId = bundle.subscribeData.id;

  z.console.log('===== TASK COMPLETED UNSUBSCRIBE =====', subscriptionId);

  const response = await z.request({
    url: `https://app.indev2.proofhub.com/oauth/ss_zapier/public/zapier/triggers/subscribe/${subscriptionId}`,
    method: 'DELETE',
  });

  response.throwForStatus();
  return response.data;
};

// Matches the real payload: { item_id, item_json: { completed, name?, description? }, ... }
const getItem = (raw) => {
  return raw.item_json && typeof raw.item_json === 'object'
    ? raw.item_json
    : {};
};

const shapeTask = (raw = {}) => {
  const item = getItem(raw);

  const rawId =
    raw.item_id ??
    raw.task_id ??
    raw.id ??
    item.id;

  const completed =
    item.completed === true ||
    item.completed === 1 ||
    item.completed === '1' ||
    item.completed === 'true' ||
    raw.completed === true ||
    raw.completed === 1 ||
    raw.completed === '1' ||
    raw.completed === 'true';

  return {
    id: rawId != null ? String(rawId) : undefined,

    task_id: rawId != null ? String(rawId) : undefined,

    name:
      item.name ??
      raw.name ??
      (rawId != null ? `Task #${rawId}` : undefined),

    description:
      item.description ??
      raw.description ??
      undefined,

    wsid:
      raw.wsid != null
        ? String(raw.wsid)
        : undefined,

    project_id:
      raw.project_id != null
        ? String(raw.project_id)
        : undefined,

    status:
      completed
        ? 'completed'
        : raw.status ?? item.status ?? undefined,

    completed_at:
      raw.completed_at ??
      item.completed_at ??
      (completed ? raw.last_activity_at : undefined),

    updated_at:
      raw.last_activity_at ??
      raw.updated_at ??
      item.updated_at ??
      undefined,
  };
};

const perform = async (z, bundle) => {
  const raw = bundle.cleanedRequest || {};

  z.console.log(
    '===== WEBHOOK RECEIVED =====',
    JSON.stringify(raw)
  );

  const shaped = shapeTask(raw);

  z.console.log(
    '===== SHAPED DATA =====',
    JSON.stringify(shaped)
  );

  return [shaped];
};

const performList = async (z, bundle) => {
  const response = await z.request({
    url: 'https://app.indev2.proofhub.com/oauth/ss_zapier/public/zapier/triggers',
    method: 'GET',
    params: {
      event: 'completed_task',
      wsid: bundle.inputData.wsid,
      project_id: bundle.inputData.project_id,
      task_id: bundle.inputData.task_id,
    },
  });

  response.throwForStatus();

  const data = response.data;
  const list = Array.isArray(data) ? data : data.data || [];

  // Filter the same way perform() does — only completed tasks
  return list
    .filter((raw) => (raw.item_json || {}).completed === true)
    .map(shapeTask);
};

module.exports = {
  key: 'task_completed',
  noun: 'Task',

  display: {
    label: 'Task Completed',
    description: 'Triggers instantly when a task is completed in ProofHub.',
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
    ],

    performSubscribe,
    performUnsubscribe,
    perform,
    performList,

    sample: {
      id: '111596',
      task_id: '111596',
      name: 'Sample Task',
      description: 'Sample description',
      wsid: '4598',
      project_id: '36290',
      status: 'completed',
      completed_at: '2026-08-26T12:02:32.701132Z',
      updated_at: '2026-08-26T12:02:32.701132Z',
    },

    outputFields: [
      { key: 'id', label: 'Task ID', type: 'string' },
      { key: 'task_id', label: 'Task ID', type: 'string' },
      { key: 'name', label: 'Task Name', type: 'string' },
      { key: 'description', label: 'Description', type: 'string' },
      { key: 'wsid', label: 'Workspace ID', type: 'string' },
      { key: 'project_id', label: 'Project ID', type: 'string' },
      { key: 'status', label: 'Status', type: 'string' },
      { key: 'completed_at', label: 'Completed At', type: 'string' },
    ],
  },
};