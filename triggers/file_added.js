'use strict';

const performSubscribe = async (z, bundle) => {
  z.console.log('===== FILE ADDED SUBSCRIBE CALLED =====');
  z.console.log('INPUT DATA:', bundle.inputData);
  z.console.log('TARGET URL:', bundle.targetUrl);

  const response = await z.request({
    url: 'https://app.indev2.proofhub.com/oauth/ss_zapier/public/zapier/triggers/subscribe',
    method: 'POST',
    body: {
      event: 'file_added_on_task',
      wsid: bundle.inputData.wsid,
      project_id: bundle.inputData.project_id,
      task_id: bundle.inputData.task_id,
      url: bundle.targetUrl,
    },
  });

  z.console.log('FILE ADDED SUBSCRIBE RESPONSE:', response.data);
  response.throwForStatus();
  return response.data;
};

const performUnsubscribe = async (z, bundle) => {
  const subscriptionId = bundle.subscribeData.id;

  z.console.log('===== FILE ADDED UNSUBSCRIBE =====', subscriptionId);

  const response = await z.request({
    url: `https://app.indev2.proofhub.com/oauth/ss_zapier/public/zapier/triggers/subscribe/${subscriptionId}`,
    method: 'DELETE',
  });

  response.throwForStatus();
  return response.data;
};

const extractAttachmentId = (url) => {
  if (!url) {
    return undefined;
  }

  const match = String(url).match(/\/(\d+)(?:\/)?$/);

  return match ? match[1] : undefined;
};

const getItemJson = (raw = {}) => {
  return raw.item_json && typeof raw.item_json === 'object'
    ? raw.item_json
    : {};
};

const shapeFile = (raw = {}, attachment = {}) => {
  const item = getItemJson(raw);

  /*
   * File ID priority:
   * 1. attachment.id
   * 2. attachment.file_id
   * 3. raw.file_id
   * 4. raw.attachment_id
   * 5. URL se extract
   * 6. raw.id
   * 7. raw.item_id
   *
   * Last fallback is only to make sure Zapier gets
   * a stable ID even if the payload is incomplete.
   */
  const fallbackId =
    attachment.id ??
    attachment.file_id ??
    raw.file_id ??
    raw.attachment_id ??
    extractAttachmentId(
      attachment.attachment_web_url ||
      attachment.attachment_url ||
      raw.attachment_web_url ||
      raw.attachment_url
    ) ??
    raw.id ??
    raw.item_id;

  const taskId =
    raw.task_id ??
    item.task_id ??
    (raw.item_type === 'task' ? raw.item_id : undefined);

  return {
    id: fallbackId != null ? String(fallbackId) : undefined,

    file_id: fallbackId != null
      ? String(fallbackId)
      : undefined,

    name:
      attachment.name ??
      attachment.file_name ??
      item.name ??
      raw.name ??
      undefined,

    wsid:
      raw.wsid != null
        ? String(raw.wsid)
        : undefined,

    project_id:
      raw.project_id != null
        ? String(raw.project_id)
        : undefined,

    task_id:
      taskId != null
        ? String(taskId)
        : undefined,

    url:
      attachment.attachment_web_url ??
      attachment.attachment_url ??
      raw.attachment_web_url ??
      raw.attachment_url ??
      undefined,

    created_at:
      raw.created_at ??
      raw.last_activity_at ??
      attachment.created_at ??
      undefined,

    updated_at:
      raw.updated_at ??
      raw.last_activity_at ??
      undefined,
  };
};
const perform = async (z, bundle) => {
  const raw = bundle.cleanedRequest || {};

  z.console.log('===== FILE ADDED WEBHOOK RECEIVED =====');
  z.console.log(
    'Raw file payload:',
    JSON.stringify(raw)
  );

  const item = getItemJson(raw);

  const attachments = Array.isArray(item.attachments)
    ? item.attachments
    : [];

  let shaped;

  if (attachments.length > 0) {
    shaped = attachments.map((attachment) =>
      shapeFile(raw, attachment)
    );
  } else {
    // item_json/attachments may not exist.
    // Still return the webhook payload as one item.
    shaped = [shapeFile(raw)];
  }

  z.console.log(
    'Shaped output:',
    JSON.stringify(shaped)
  );

  return shaped;
};

const performList = async (z, bundle) => {
  const response = await z.request({
    url: 'https://app.indev2.proofhub.com/oauth/ss_zapier/public/zapier/triggers',
    method: 'GET',
    params: {
      event: 'file_added_on_task',
      wsid: bundle.inputData.wsid,
      project_id: bundle.inputData.project_id,
      task_id: bundle.inputData.task_id,
    },
  });

  response.throwForStatus();

  const data = response.data;

  const list = Array.isArray(data)
    ? data
    : data.data || [];

  return list.flatMap((raw) => {
    const item = getItemJson(raw);

    const attachments = Array.isArray(item.attachments)
      ? item.attachments
      : [];

    if (attachments.length > 0) {
      return attachments.map((attachment) =>
        shapeFile(raw, attachment)
      );
    }

    return [shapeFile(raw)];
  });
};
module.exports = {
  key: 'file_added',
  noun: 'File',

  display: {
    label: 'File Added',
    description: 'Triggers instantly when a file is added in ProofHub.',
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
      id: '1688180597',
      file_id: '1688180597',
      name: 'Sample File.pdf',
      wsid: '4598',
      project_id: '36290',
      task_id: '111596',
      url: 'https://app.indev2.proofhub.com/v5/ss_zapier/public/assets/workspaces/609755230109/projects/1584647302/tasks/1509011008/attachments/1688180597/v/672770336',
      created_at: '2026-08-26T11:11:25.538684Z',
    },

    outputFields: [
      { key: 'id', label: 'File ID', type: 'string' },
      { key: 'file_id', label: 'File ID', type: 'string' },
      { key: 'name', label: 'File Name', type: 'string' },
      { key: 'wsid', label: 'Workspace ID', type: 'string' },
      { key: 'project_id', label: 'Project ID', type: 'string' },
      { key: 'task_id', label: 'Task ID', type: 'string' },
      { key: 'url', label: 'File URL', type: 'string' },
      { key: 'created_at', label: 'Created At', type: 'string' },
    ],
  },
};