'use strict';

const PROOFHUB_BASE_URL =
  'https://app.indev2.proofhub.com/oauth/ss_zapier/public';

const performSubscribe = async (z, bundle) => {
  const response = await z.request({
    url: `${PROOFHUB_BASE_URL}/zapier/triggers/subscribe`,
    method: 'POST',
    body: {
      event: 'completed_task',
      wsid: bundle.inputData.wsid,
      project_id: bundle.inputData.project_id,
      url: bundle.targetUrl,
    },
  });

  response.throwForStatus();
  return response.data;
};

const performUnsubscribe = async (z, bundle) => {
  const subscriptionId = bundle.subscribeData && bundle.subscribeData.id;

  if (!subscriptionId) {
    return {};
  }

  const response = await z.request({
    url: `${PROOFHUB_BASE_URL}/zapier/triggers/subscribe/${subscriptionId}`,
    method: 'DELETE',
  });

  response.throwForStatus();
  return response.data;
};

const getItem = (raw = {}) => {
  return raw.item_json && typeof raw.item_json === 'object'
    ? raw.item_json
    : {};
};

const isCompleted = (raw = {}) => {
  const item = getItem(raw);

  return (
    item.completed === true ||
    item.completed === 1 ||
    item.completed === '1' ||
    item.completed === 'true' ||
    raw.completed === true ||
    raw.completed === 1 ||
    raw.completed === '1' ||
    raw.completed === 'true'
  );
};

const shapeTask = (raw = {}) => {
  const item = getItem(raw);

  const rawId = raw.item_id ?? raw.task_id ?? raw.id ?? item.id;
  const completed = isCompleted(raw);

  const projectId =
    raw.project_id ?? item.project_id ?? raw.project_wise_task?.project_id;

  const workspaceId =
    raw.wsid ?? raw.workspace_id ?? item.wsid ?? item.workspace_id;

  return {
    ...raw,
    ...item,

    id: rawId != null ? String(rawId) : undefined,
    task_id: rawId != null ? String(rawId) : undefined,
    name: item.name ?? item.title ?? raw.name ?? raw.title ?? undefined,
    description: item.description ?? raw.description ?? undefined,
    wsid: workspaceId != null ? String(workspaceId) : undefined,
    project_id: projectId != null ? String(projectId) : undefined,
    status: completed ? 'completed' : raw.status ?? item.status ?? undefined,
    completed_at:
      raw.completed_at ??
      item.completed_at ??
      (completed ? raw.last_activity_at : undefined),
    updated_at:
      raw.last_activity_at ?? raw.updated_at ?? item.updated_at ?? undefined,
  };
};

const perform = async (z, bundle) => {
  const raw = bundle.cleanedRequest || {};

  z.console.log('RAW WEBHOOK DATA:', JSON.stringify(raw));

  const shaped = shapeTask(raw);

  z.console.log('SHAPED TASK DATA:', JSON.stringify(shaped));

  return [shaped];
};

const performList = async (z, bundle) => {
  const params = { event: 'completed_task' };

  if (bundle.inputData.wsid) params.wsid = bundle.inputData.wsid;
  if (bundle.inputData.project_id) params.project_id = bundle.inputData.project_id;

  const response = await z.request({
    url: `${PROOFHUB_BASE_URL}/zapier/triggers`,
    method: 'GET',
    params,
  });

  response.throwForStatus();

  const data = response.data;

  let list = [];
  if (Array.isArray(data)) {
    list = data;
  } else if (Array.isArray(data.data)) {
    list = data.data;
  } else if (Array.isArray(data.original)) {
    list = data.original;
  }

  const completedTasks = list.filter(isCompleted).map(shapeTask);

  z.console.log('SHAPED COMPLETED TASKS:', JSON.stringify(completedTasks));

  return completedTasks;
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
      id: '112731',
      task_id: '112731',
      workspace_id: 6190,
      name: 'new task to test zap add task trigger',
      description: null,
      priority: 'normal',
      completed: true,
      completed_at: '2026-09-03T10:00:00Z',
      progress: 100,
      created_at: '2026-08-31T07:51:05Z',
      updated_at: '2026-09-03T10:00:00Z',
      project_wise_task: {
        project_id: 47171,
        section_id: 84054,
      },
      wsid: '6190',
      project_id: '47171',
      status: 'completed',
    },
  },
};