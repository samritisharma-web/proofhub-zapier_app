// creates/create_subtask.js
'use strict';
const { requestAction } = require('../utils/request_action');

const perform = async (z, bundle) => {
  const data = await requestAction(z, 'create_subtask', {
    task_id: bundle.inputData.task_id,
    wsid: bundle.inputData.wsid,
    project_id: bundle.inputData.project_id,
    title: bundle.inputData.title,
  });

  return { id: `pending-${Date.now()}`, status: data.status, message: data.message };
};

module.exports = {
  key: 'create_subtask',
  noun: 'Subtask',
  display: { label: 'Create subtask', description: 'Creates a subtask under an existing task in ProofHub.' },
  operation: {
    inputFields: [
      { key: 'wsid', label: 'Workspace', type: 'string', required: true, dynamic: 'workspacesList.id.name', altersDynamicFields: true },
      { key: 'project_id', label: 'Project', type: 'string', required: true, dynamic: 'ProjectsList.id.name', altersDynamicFields: true },
      { key: 'task_id', label: 'Parent Task', type: 'string', required: true, dynamic: 'tasksList.id.name' },
      { key: 'title', label: 'Subtask Title', type: 'string', required: true },
    ],
    perform,
    sample: { id: 'pending-sample', status: 'accepted', message: 'Subtask creation queued.' },
  },
};