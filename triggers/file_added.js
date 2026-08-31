'use strict';

const performSubscribe = async (z, bundle) => {
  z.console.log('===== FILE ADDED SUBSCRIBE CALLED =====');
  z.console.log('INPUT DATA:', bundle.inputData);
  z.console.log('TARGET URL:', bundle.targetUrl);

  const response = await z.request({
    url: 'https://app.indev2.proofhub.com/oauth/ss_zapier/public/zapier/triggers/subscribe',
    method: 'POST',
    body: {
      event: 'file_added',
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

// Pulls a fallback numeric id out of the attachment_web_url,
// since ProofHub sends attachment.id as null.
// e.g. ".../attachments/1688180597/v/672770336" -> "1688180597"
const extractAttachmentId = (webUrl) => {
  if (!webUrl) return undefined;
  const match = webUrl.match(/attachments\/(\d+)/);
  return match ? match[1] : undefined;
};

// Shapes ONE attachment object into the output row.
// raw = the full webhook payload (for wsid, project_id, task_id, timestamp)
// attachment = a single entry from item_json.attachments
const shapeFile = (raw = {}, attachment = {}) => {
  const fallbackId = attachment.id != null
    ? attachment.id
    : extractAttachmentId(attachment.attachment_web_url);

  // item_id at the top level is the task's id when item_type === "task"
  const taskId = raw.item_id != null ? raw.item_id : raw.task_id;

  return {
    id: fallbackId != null ? String(fallbackId) : undefined,
    file_id: fallbackId != null ? String(fallbackId) : undefined,
    name: attachment.name || undefined,

    wsid: raw.wsid != null ? String(raw.wsid) : undefined,
    project_id: raw.project_id != null ? String(raw.project_id) : undefined,
    task_id: taskId != null ? String(taskId) : undefined,

    // attachment_url was empty in the sample — attachment_web_url is the real usable link
    url: attachment.attachment_web_url || attachment.attachment_url || undefined,

    created_at: raw.last_activity_at || raw.created_at || undefined,
  };
};

const perform = async (z, bundle) => {
  const raw = bundle.cleanedRequest || {};

  z.console.log('===== FILE ADDED =====');
  z.console.log('Raw file payload:', raw);

  const attachments = (raw.item_json && raw.item_json.attachments) || [];

  // One or more files can arrive in a single event — emit one row per file
  const shaped = attachments.length > 0
    ? attachments.map((att) => shapeFile(raw, att))
    : [shapeFile(raw, {})]; // fallback so we never return an empty array on a malformed event

  z.console.log('Shaped output:', shaped);

  return shaped;
};

const performList = async (z, bundle) => {
  const response = await z.request({
    url: 'https://app.indev2.proofhub.com/oauth/ss_zapier/public/zapier/triggers',
    method: 'GET',
    params: {
      event: 'file_added',
      wsid: bundle.inputData.wsid,
      project_id: bundle.inputData.project_id,
      task_id: bundle.inputData.task_id,
    },
  });

  response.throwForStatus();

  const data = response.data;
  const list = Array.isArray(data) ? data : data.data || [];

  // Each list item may itself contain multiple attachments — flatten them
  return list.flatMap((raw) => {
    const attachments = (raw.item_json && raw.item_json.attachments) || [];
    return attachments.length > 0
      ? attachments.map((att) => shapeFile(raw, att))
      : [shapeFile(raw, {})];
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