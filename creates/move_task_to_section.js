'use strict';
const { requestAction } = require('../utils/request_action');

const perform = async (z, bundle) => {
  const data = await requestAction(z, 'move_task_to_section', {
    task_id: bundle.inputData.task_id,
    wsid: bundle.inputData.wsid,
    project_id: bundle.inputData.project_id,
    section_id: bundle.inputData.section_id,
  });

  return { id: `pending-${Date.now()}`, status: data.status, message: data.message, task_id: bundle.inputData.task_id };
};

module.exports = {
  key: 'move_task_to_section',
  noun: 'Task',
  display: { label: 'Move Task to Section', description: 'Moves an existing task to a different section in ProofHub.' },
  operation: {
    inputFields: [
      { key: 'wsid', label: 'Workspace', type: 'string', required: true, dynamic: 'workspacesList.id.name', altersDynamicFields: true },
      { key: 'project_id', label: 'Project', type: 'string', required: true, dynamic: 'ProjectsList.id.name', altersDynamicFields: true },
      { key: 'task_id', label: 'Task', type: 'string', required: true, dynamic: 'tasksList.id.name' },
      {
        key: 'section_id',
        label: 'Section',
        type: 'string',
        required: true,
        dynamic: 'sectionsList.id.name',
      },
    ],
    perform,
    sample: { id: 'pending-sample', status: 'accepted', message: 'Task moved to section.', task_id: 520 },
  },
};