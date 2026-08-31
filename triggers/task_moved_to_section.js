'use strict';

const performSubscribe = async (z, bundle) => {
  z.console.log('===== TASK MOVED TO SECTION SUBSCRIBE CALLED =====');
  z.console.log('INPUT DATA:', bundle.inputData);
  z.console.log('TARGET URL:', bundle.targetUrl);

  const response = await z.request({
    url: 'https://app.indev2.proofhub.com/oauth/ss_zapier/public/zapier/triggers/subscribe',
    method: 'POST',
    body: {
      // Confirmed: section moves arrive as "updated_task" with
      // item_json.move_case === "move_to_section", same as completion
      // events use item_json.completed. There is no distinct
      // "moved_to_section" server-side event.
      event: 'updated_task',
      wsid: bundle.inputData.wsid,
      project_id: bundle.inputData.project_id,
      task_id: bundle.inputData.task_id,
      url: bundle.targetUrl,
    },
  });

  z.console.log('TASK MOVED TO SECTION SUBSCRIBE RESPONSE:', response.data);
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

// Matches the CONFIRMED real payload:
// item_json: { move_case: "move_to_section", user: {...}, section: { id, name }, project: {...} }
const shapeTask = (raw = {}) => {
  const item = raw.item_json || {};
  const rawId = raw.item_id != null ? raw.item_id : raw.id;

  const section = item.section || {};
  const user = item.user || {};
  const project = item.project || {};

  return {
    id: rawId != null ? String(rawId) : undefined,
    task_id: rawId != null ? String(rawId) : undefined,

    wsid: raw.wsid != null ? String(raw.wsid) : undefined,
    project_id: (project.id != null ? project.id : raw.project_id) != null
      ? String(project.id != null ? project.id : raw.project_id)
      : undefined,
    project_name: project.name || undefined,

    section_id: section.id != null ? String(section.id) : undefined,
    section_name: section.name || undefined,

    moved_by_user_id: user.id != null ? String(user.id) : undefined,
    moved_by_name: [user.first_name, user.last_name].filter(Boolean).join(' ') || undefined,
    moved_by_email: user.email || undefined,

    updated_at: raw.last_activity_at || raw.updated_at || undefined,
  };
};

const perform = async (z, bundle) => {
  const raw = bundle.cleanedRequest || {};

  z.console.log('===== TASK UPDATE RECEIVED (checking for section move) =====');
  z.console.log('Raw payload:', raw);

  const item = raw.item_json || {};

  // The real signal for a section move is move_case === "move_to_section",
  // not a flat section_id field.
  if (item.move_case !== 'move_to_section') {
    z.console.log(`Not a section-move event (move_case: ${item.move_case}) — skipping`);
    return [];
  }

  const shaped = shapeTask(raw);

  z.console.log('Shaped output:', shaped);

  return [shaped];
};

const performList = async (z, bundle) => {
  z.console.log('===== TASK MOVED TO SECTION - performList (no live list endpoint, using sample) =====');

  // The ProofHub endpoint /zapier/triggers returned 404 ("File not found")
  // on indev2 — it isn't implemented server-side. Returning static sample
  // data here so "Test Trigger" works in the Zap editor without erroring.
  // Live events still flow correctly through the real webhook (perform above).
  return [
    {
      id: '111591',
      task_id: '111591',
      wsid: bundle.inputData.wsid
        ? String(bundle.inputData.wsid)
        : '4598',
      project_id: bundle.inputData.project_id
        ? String(bundle.inputData.project_id)
        : '36290',
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
        key: 'task_id',
        label: 'Task',
        type: 'string',
        required: false,
        dynamic: 'tasksList.id.name',
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

    outputFields: [
      { key: 'id', label: 'Task ID', type: 'string' },
      { key: 'task_id', label: 'Task ID', type: 'string' },
      { key: 'wsid', label: 'Workspace ID', type: 'string' },
      { key: 'project_id', label: 'Project ID', type: 'string' },
      { key: 'project_name', label: 'Project Name', type: 'string' },
      { key: 'section_id', label: 'Section ID', type: 'string' },
      { key: 'section_name', label: 'Section Name', type: 'string' },
      { key: 'moved_by_user_id', label: 'Moved By (User ID)', type: 'string' },
      { key: 'moved_by_name', label: 'Moved By (Name)', type: 'string' },
      { key: 'moved_by_email', label: 'Moved By (Email)', type: 'string' },
      { key: 'updated_at', label: 'Updated At', type: 'string' },
    ],
  },
};