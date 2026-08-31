'use strict';
const { requestAction } = require('../utils/request_action');

const perform = async (z, bundle) => {
  const data = await requestAction(z, 'mark_as_done', {
    task_id: bundle.inputData.task_id,
    project_id: bundle.inputData.project_id,
    wsid: bundle.inputData.wsid,
  });

  return {
    id: `pending-${Date.now()}`,
    status: data.status,
    message: data.message,
    task_id: bundle.inputData.task_id,
  };
};

module.exports = {
  key: 'mark_as_done',
  noun: 'Task',
  display: { label: 'Mark Task as Done', description: 'Marks an existing task as completed in ProofHub.' },
  operation: {
    inputFields: [
      { key: 'wsid', label: 'Workspace', type: 'string', required: true, dynamic: 'workspacesList.id.name', altersDynamicFields: true },
      { key: 'project_id', label: 'Project', type: 'string', required: true, dynamic: 'ProjectsList.id.name', altersDynamicFields: true },
      { key: 'task_id', label: 'Task', type: 'string', required: true, dynamic: 'tasksList.id.name' },
    ],
    perform,
    sample: { id: 'pending-sample', status: 'accepted', message: 'Task marked as done.', task_id: 520 },
  },
};