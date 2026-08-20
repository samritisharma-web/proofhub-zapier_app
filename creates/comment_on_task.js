'use strict';

const { requestAction } = require('../utils/request_action');

const perform = async (z, bundle) => {
  const data = await requestAction(z, 'comment_on_task', {
    workspace_id: bundle.inputData.workspace_id,
    project_id: bundle.inputData.project_id,
    task_id: bundle.inputData.task_id,
    comment: bundle.inputData.comment,
  });

  return {
    id: `comment-${Date.now()}`,
    status: data.status,
    message: data.message,
    task_id: bundle.inputData.task_id,
  };
};

module.exports = {
  key: 'comment_on_task',
  noun: 'Comment',

  display: {
    label: 'Add Comment on Task',
    description: 'Adds a comment to an existing ProofHub task.',
  },

  operation: {
    inputFields: [
      {
        key: 'workspace_id',
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
        required: true,
        dynamic: 'tasksList.id.name',
      },
      {
        key: 'comment',
        label: 'Comment',
        type: 'string',
        required: true,
        helpText: 'Enter the comment you want to add to the task.',
      },
    ],

    perform,

    sample: {
      id: 'comment-sample',
      status: 'success',
      message: 'Comment added successfully.',
      task_id: 520,
    },
  },
};