'use strict';

const { requestAction } = require('../utils/request_action');

const perform = async (z, bundle) => {
  const data = await requestAction(z, 'copy_task', {
    task_id: bundle.inputData.task_id,
    title: bundle.inputData.title,
    wsid: bundle.inputData.wsid,
    project_id: bundle.inputData.project_id,
    include_description: bundle.inputData.include_description,
    include_assignee: bundle.inputData.include_assignee,
    include_subtasks: bundle.inputData.include_subtasks,
    include_attachments: bundle.inputData.include_attachments,
    include_tags: bundle.inputData.include_tags,
    include_collaborators: bundle.inputData.include_collaborators,
    include_dates: bundle.inputData.include_dates,
    include_progress: bundle.inputData.include_progress,
    include_estimated_time: bundle.inputData.include_estimated_time,
  });

  return {
    id: `pending-${Date.now()}`,
    status: data?.status || 'accepted',
    message: data.message,
  };
};

module.exports = {
  key: 'copy_task',
  noun: 'Copy task',

  display: {
    label: 'Copy task',
    description: 'Duplicates an existing ProofHub task with the selected details.',
  },

  operation: {
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
        label: 'Task to Duplicate',
        type: 'string',
        required: true,
        dynamic: 'tasksList.id.name',
      },
      {
        key: 'title',
        label: 'New Task Title',
        type: 'string',
        required: false,
      },

      {
        key: 'include_description',
        label: 'Include Description',
        type: 'boolean',
        default: 'true',
        required: false,
      },
      {
        key: 'include_assignee',
        label: 'Include Assignee',
        type: 'boolean',
        default: 'false',
        required: false,
      },
      {
        key: 'include_subtasks',
        label: 'Include Subtasks',
        type: 'boolean',
        default: 'true',
        required: false,
      },
      {
        key: 'include_attachments',
        label: 'Include Attachments',
        type: 'boolean',
        default: 'true',
        required: false,
      },
      {
        key: 'include_tags',
        label: 'Include Tags',
        type: 'boolean',
        default: 'true',
        required: false,
      },
      {
        key: 'include_collaborators',
        label: 'Include Collaborators',
        type: 'boolean',
        default: 'false',
        required: false,
      },
      {
        key: 'include_dates',
        label: 'Include Start & Due Date',
        type: 'boolean',
        default: 'false',
        required: false,
      },
      {
        key: 'include_progress',
        label: 'Include Progress',
        type: 'boolean',
        default: 'true',
        required: false,
      },
      {
        key: 'include_estimated_time',
        label: 'Include Estimated Time',
        type: 'boolean',
        default: 'true',
        required: false,
      },
    ],

    perform,

    sample: {
      id: 'pending-sample',
      status: 'accepted',
      message: 'Task duplication request received.',
    },
  },
};