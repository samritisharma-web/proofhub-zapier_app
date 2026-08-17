'use strict';
const { requestAction } = require('../utils/request_action');

const perform = async (z, bundle) => {
  const data = await requestAction(z, 'mark_as_approved', {
    task_id: bundle.inputData.task_id,
    workspace_id: bundle.inputData.workspace_id,
    project_id: bundle.inputData.project_id,
    approval_status: bundle.inputData.approval_status,
  });

  return {
    id: `pending-${Date.now()}`,
    status: data.status,
    message: data.message,
    task_id: bundle.inputData.task_id,
  };
};

module.exports = {
  key: 'mark_as_approved',
  noun: 'Task',
  display: {
    label: 'Mark Task as Approved',
    description: 'Updates the approval status of a task in ProofHub.',
  },
  operation: {
    inputFields: [
      { key: 'workspace_id', label: 'Workspace', type: 'string', required: true, dynamic: 'workspacesList.id.name', altersDynamicFields: true },
      { key: 'project_id', label: 'Project', type: 'string', required: true, dynamic: 'ProjectsList.id.name', altersDynamicFields: true },
      { key: 'task_id', label: 'Task', type: 'string', required: true, dynamic: 'tasksList.id.name' },
      {
        key: 'approval_status',
        label: 'Approval Status',
        type: 'string',
        required: true,
        choices: {
          pending: 'Pending',
          approved: 'Approved',
          rejected: 'Rejected',
          changes_requested: 'Changes Requested',
        },
      },
    ],
    perform,
    sample: {
      id: 'pending-sample',
      status: 'accepted',
      message: 'Task approval status updated.',
      task_id: 520,
    },
  },
};