// creates/copy_task.js
'use strict';
const { requestAction } = require('../utils/request_action');

const perform = async (z, bundle) => {
  // TODO: yeh actually updateTask nahi honi chahiye — naya task banega parent_id ke saath
  const data = await requestAction(z, 'copy_task', {
    task_id: bundle.inputData.task_id,
    title: bundle.inputData.title,
  });

  return { id: `pending-${Date.now()}`, status: data.status, message: data.message };
};

module.exports = {
  key: 'copy_task',
  noun: 'Task',
  display: { label: 'Copy task', description: 'Creates a subtask under an existing task in ProofHub.' },
  operation: {
    inputFields: [
      { key: 'workspace_id', label: 'Workspace', type: 'string', required: true, dynamic: 'workspacesList.id.name', altersDynamicFields: true },
      { key: 'project_id', label: 'Project', type: 'string', required: true, dynamic: 'ProjectsList.id.name', altersDynamicFields: true },
      { key: 'task_id', label: 'Parent Task', type: 'string', required: true, dynamic: 'tasksList.id.name' },
      { key: 'title', label: 'Subtask Title', type: 'string', required: true },
    ],
    perform,
    sample: { id: 'pending-sample', status: 'accepted', message: 'Subtask creation queued.' },
  },
};