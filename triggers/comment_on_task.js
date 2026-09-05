'use strict';

const performSubscribe = async (z, bundle) => {
  z.console.log('===== SUBSCRIBE CALLED (comment_on_task) =====');
  z.console.log('INPUT DATA:', bundle.inputData);
  z.console.log('TARGET URL:', bundle.targetUrl);

  const response = await z.request({
    url: 'https://app.indev2.proofhub.com/oauth/ss_zapier/public/zapier/triggers/subscribe',
    method: 'POST',
    body: {
      event: 'comment_on_task',
      wsid: bundle.inputData.wsid,
      project_id: bundle.inputData.project_id,
      task_id: bundle.inputData.task_id,
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

const shapeComment = (raw = {}) => {
  const item = raw.item_json || {};

  const rawId = raw.item_id != null ? raw.item_id : raw.id;

  return {
    ...raw,
    ...item,

    id: rawId != null ? String(rawId) : undefined,
    comment_id: rawId != null ? String(rawId) : undefined,
    comment:
      item.comment || item.content || item.text || '(no comment text provided by ProofHub)',

    wsid: raw.wsid != null ? String(raw.wsid) : undefined,
    project_id: raw.project_id != null ? String(raw.project_id) : undefined,

    task_id: raw.task_id != null ? String(raw.task_id) : undefined,

    user_id: raw.action_by != null ? String(raw.action_by) : undefined,

    created_at: raw.last_activity_at || raw.created_at || undefined,
  };
};

const perform = async (z, bundle) => {
  const raw = bundle.cleanedRequest || {};

  z.console.log('===== COMMENT ON TASK =====');
  z.console.log('Raw comment payload:', raw);

  const shaped = shapeComment(raw);

  z.console.log('Shaped output:', shaped);

  return [shaped];
};

const performList = async (z, bundle) => {
  const response = await z.request({
    url: 'https://app.indev2.proofhub.com/oauth/ss_zapier/public/zapier/triggers',
    method: 'GET',
    params: {
      event: 'comment_on_task',
      wsid: bundle.inputData.wsid,
      project_id: bundle.inputData.project_id,
      task_id: bundle.inputData.task_id,
    },
  });

  response.throwForStatus();

  const data = response.data;
  const list = Array.isArray(data) ? data : data.data || [];

  return list.map(shapeComment);
};

module.exports = {
  key: 'comment_on_task',
  noun: 'Comment',

  display: {
    label: 'Comment on Task',
    description: 'Triggers instantly when a comment is added to a task in ProofHub.',
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
        required: false,
        dynamic: 'tasksList.id.name',
      },
    ],

    performSubscribe,
    performUnsubscribe,
    perform,
    performList,

    sample: {
      id: '7805',
      comment_id: '7805',
      comment: 'Sample comment',
      wsid: '4598',
      project_id: '36290',
      task_id: '101416',
      user_id: '3725',
      action_by: '3725',
      created_at: '2026-08-26T10:40:00.391329Z',
    },
  },
};