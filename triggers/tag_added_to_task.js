'use strict';

const performSubscribe = async (z, bundle) => {
  z.console.log('===== TAG ADDED TO TASK SUBSCRIBE CALLED =====');
  z.console.log('INPUT DATA:', bundle.inputData);
  z.console.log('TARGET URL:', bundle.targetUrl);

  const response = await z.request({
    url: 'https://app.indev2.proofhub.com/oauth/ss_zapier/public/zapier/triggers/subscribe',
    method: 'POST',
    body: {
      event: 'tag_added_to_task',
      wsid: bundle.inputData.wsid,
      project_id: bundle.inputData.project_id,
      task_id: bundle.inputData.task_id,
      url: bundle.targetUrl,
    },
  });

  z.console.log('TAG ADDED TO TASK SUBSCRIBE RESPONSE:', response.data);

  response.throwForStatus();

  return response.data;
};

const performUnsubscribe = async (z, bundle) => {
  const subscriptionId = bundle.subscribeData.id;

  z.console.log('===== TAG ADDED TO TASK UNSUBSCRIBE =====', subscriptionId);

  const response = await z.request({
    url: `https://app.indev2.proofhub.com/oauth/ss_zapier/public/zapier/triggers/subscribe/${subscriptionId}`,
    method: 'DELETE',
  });

  response.throwForStatus();

  return response.data;
};

const shapeTag = (raw = {}) => {
  const item = raw.item_json && typeof raw.item_json === 'object' ? raw.item_json : {};

  const rawId =
    raw.id != null ? raw.id : (raw.task_id != null ? raw.task_id : raw.item_id);

  return {
    ...raw,
    ...item,

    id: rawId != null ? String(rawId) : undefined,
    name: item.name ?? raw.name ?? undefined,
    description: item.description ?? raw.description ?? undefined,

    wsid: raw.wsid != null ? String(raw.wsid) : undefined,
    project_id: raw.project_id != null ? String(raw.project_id) : undefined,

    task_id:
      raw.task_id != null
        ? String(raw.task_id)
        : (rawId != null ? String(rawId) : undefined),

    tag_id: (item.tag_id ?? raw.tag_id) != null ? String(item.tag_id ?? raw.tag_id) : undefined,
    tag_name: item.tag_name ?? raw.tag_name ?? undefined,

    updated_at: raw.last_activity_at ?? raw.updated_at ?? undefined,
  };
};

const perform = async (z, bundle) => {
  const raw = bundle.cleanedRequest || {};

  z.console.log('===== TAG ADDED TO TASK =====');
  z.console.log('Raw payload:', raw);

  const shaped = shapeTag(raw);

  z.console.log('Shaped output:', shaped);
  return [shaped];
};

const performList = async (z, bundle) => {
  const response = await z.request({
    url: 'https://app.indev2.proofhub.com/oauth/ss_zapier/public/zapier/triggers',
    method: 'GET',
    params: {
      event: 'tag_added_to_task',
      wsid: bundle.inputData.wsid,
      project_id: bundle.inputData.project_id,
      task_id: bundle.inputData.task_id,
      tags: bundle.inputData.tags,
    },
  });

  response.throwForStatus();

  const data = response.data;
  const list = Array.isArray(data) ? data : data.data || [];
  return list.map(shapeTag);
};

module.exports = {
  key: 'tag_added_to_task',
  noun: 'Task',

  display: {
    label: 'Tag Added to Task',
    description: 'Triggers instantly when a tag is added to a task in ProofHub.',
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
      },
      {
        key: 'tag_id',
        label: 'Tag',
        type: 'string',
        required: false,
        dynamic: 'tagsList.id.name',
      },
    ],

    performSubscribe,
    performUnsubscribe,
    perform,
    performList,

    sample: {
      id: '101416',
      name: 'Sample Task',
      description: 'Sample description',
      wsid: '4598',
      project_id: '36290',
      task_id: '101416',
      tag_id: '501',
      tag_name: 'Important',
      updated_at: '2026-08-21T10:00:00Z',
    },
  },
};