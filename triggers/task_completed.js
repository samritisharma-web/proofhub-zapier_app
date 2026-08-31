'use strict';

const performSubscribe = async (z, bundle) => {
  z.console.log('===== TASK COMPLETED SUBSCRIBE CALLED =====');
  z.console.log('INPUT DATA:', bundle.inputData);
  z.console.log('TARGET URL:', bundle.targetUrl);

  const response = await z.request({
    url: 'https://app.indev2.proofhub.com/oauth/ss_zapier/public/zapier/triggers/subscribe',
    method: 'POST',
    body: {
      // ProofHub has no distinct "task_completed" webhook event —
      // completion is signaled via updated_task with item_json.completed === true
      event: 'updated_task',
      wsid: bundle.inputData.wsid,
      project_id: bundle.inputData.project_id,
      task_id: bundle.inputData.task_id,
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
const shapeTask = (raw = {}) => {
  const item = raw.item_json || {};
  const rawId = raw.item_id != null ? raw.item_id : raw.id;

  return {
    id: rawId != null ? String(rawId) : undefined,
    task_id: rawId != null ? String(rawId) : undefined,
    name: item.name || (rawId != null ? `Task #${rawId}` : undefined),
    description: item.description || undefined,

    wsid: raw.wsid != null ? String(raw.wsid) : undefined,
    project_id: raw.project_id != null ? String(raw.project_id) : undefined,

    status: item.completed === true ? 'completed' : undefined,
    completed_at: item.completed === true ? (raw.last_activity_at || undefined) : undefined,
    updated_at: raw.last_activity_at || raw.updated_at || undefined,
  };
};

const perform = async (z, bundle) => {
  const raw = bundle.cleanedRequest || {};

  z.console.log('===== TASK UPDATE RECEIVED (checking for completion) =====');
  z.console.log('Raw payload:', raw);

  const item = raw.item_json || {};

  // This subscription receives ALL task updates, not just completions —
  // only emit a result when the update actually marks the task complete.
  if (item.completed !== true) {
    z.console.log('Not a completion event — skipping (completed !== true)');
    return [];
  }

  const shaped = shapeTask(raw);

  z.console.log('Shaped output:', shaped);

  return [shaped];
};

const performList = async (z, bundle) => {
  const response = await z.request({
    url: 'https://app.indev2.proofhub.com/oauth/ss_zapier/public/zapier/triggers',
    method: 'GET',
    params: {
      // Match performSubscribe — 'task_completed' isn't a real server-side event
      event: 'updated_task',
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