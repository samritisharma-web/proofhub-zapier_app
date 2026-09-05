'use strict';

const performSubscribe = async (z, bundle) => {
  z.console.log('===== SUBSCRIBE CALLED (move_to_section) =====');
  z.console.log('INPUT DATA:', bundle.inputData);
  z.console.log('TARGET URL:', bundle.targetUrl);

  const response = await z.request({
    url: 'https://app.indev2.proofhub.com/oauth/ss_zapier/public/zapier/triggers/subscribe',
    method: 'POST',
    body: {
      event: 'move_to_section',
      wsid: bundle.inputData.wsid,
      project_id: bundle.inputData.project_id,
      section_id: bundle.inputData.section_id,
      url: bundle.targetUrl,
    },
  });

  z.console.log('SUBSCRIBE RESPONSE:', response.data);
  response.throwForStatus();
  return response.data;
};

const performUnsubscribe = async (z, bundle) => {
  const subscriptionId = bundle.subscribeData.id;

  z.console.log('===== TASK MOVED TO SECTION UNSUBSCRIBE =====', subscriptionId);

  const response = await z.request({
    url: `https://app.indev2.proofhub.com/oauth/ss_zapier/public/zapier/triggers/subscribe/${subscriptionId}`,
    method: 'DELETE',
  });

  response.throwForStatus();
  return response.data;
};

const shapeTask = (raw = {}) => {
  const section = raw.section || {};
  const project = raw.project || {};

  return {
    ...raw,

    id:
      raw.id != null
        ? String(raw.id)
        : undefined,

    task_id:
      raw.task_id != null
        ? String(raw.task_id)
        : undefined,

    // Keep both workspace_id and wsid
    workspace_id:
      raw.workspace_id != null
        ? String(raw.workspace_id)
        : undefined,

    wsid:
      raw.workspace_id != null
        ? String(raw.workspace_id)
        : undefined,

    project_id:
      project.id != null
        ? String(project.id)
        : undefined,

    project_name:
      project.name || undefined,

    section_id:
      section.id != null
        ? String(section.id)
        : undefined,

    section_name:
      section.name || undefined,

    updated_at:
      raw.updated_at || undefined,
  };
};

const perform = async (z, bundle) => {
  const raw = bundle.cleanedRequest || {};

  z.console.log('===== TASK MOVED TO SECTION WEBHOOK RECEIVED =====');
  z.console.log('RAW PAYLOAD:', JSON.stringify(raw));

  const shaped = shapeTask(raw);

  z.console.log('SHAPED OUTPUT:', JSON.stringify(shaped));

  return [shaped];
};

const performList = async (z, bundle) => {
  z.console.log('===== TASK MOVED TO SECTION - performList (no live list endpoint, using sample) =====');

  return [
    {
      id: '111591',
      task_id: '111591',
      wsid: bundle.inputData.wsid ? String(bundle.inputData.wsid) : '4598',
      project_id: bundle.inputData.project_id ? String(bundle.inputData.project_id) : '36290',
      project_name: "Sam's project ws1",
      section_id: '87132',
      section_name: 'new section',
      moved_by_user_id: '3725',
      moved_by_name: 'Samriti.sharma',
      moved_by_email: 'samriti.sharma@sdplabs.com',
      updated_at: new Date().toISOString(),
    },
  ];
};

module.exports = {
  key: 'task_moved_to_section',
  noun: 'Task',

  display: {
    label: 'Task Moved to Section',
    description: 'Triggers instantly when a task is moved to another section in ProofHub.',
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
        key: 'section_id',
        label: 'Section',
        type: 'string',
        required: true,
        dynamic: 'sectionsList.id.name',
      },
    ],

    performSubscribe,
    performUnsubscribe,
    perform,
    performList,

    sample: {
      id: '111591',
      task_id: '111591',
      wsid: '4598',
      project_id: '36290',
      project_name: "Sam's project ws1",
      section_id: '87132',
      section_name: 'new section',
      moved_by_user_id: '3725',
      moved_by_name: 'Samriti.sharma',
      moved_by_email: 'samriti.sharma@sdplabs.com',
      updated_at: '2026-08-26T12:35:32.529513Z',
    },
  },
};