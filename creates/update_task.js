'use strict';
const { requestAction } = require('../utils/request_action');

const perform = async (z, bundle) => {
  const data = await requestAction(z, 'update_task', {
    workspace_id: bundle.inputData.workspace_id,
    project_id: bundle.inputData.project_id,
    task_id: bundle.inputData.task_id,
    title: bundle.inputData.title,
    description: bundle.inputData.description,
    completed: bundle.inputData.completed,
    assignee_id: bundle.inputData.assignee_id,
    due_date_type: bundle.inputData.due_date_type,
    due_at: bundle.inputData.due_at,
    followers: bundle.inputData.followers,
    tags: bundle.inputData.tags,
    rich_text: bundle.inputData.rich_text,
  });

  return {
    id: `pending-${Date.now()}`,
    status: data.status,
    message: data.message,
    task_id: bundle.inputData.task_id,
  };
};

module.exports = {
  key: 'update_task',
  noun: 'Task',
  display: {
    label: 'Update Task',
    description: 'Updates an existing task in ProofHub.',
  },
  operation: {
    inputFields: [
      { key: 'workspace_id', label: 'Workspace', type: 'string', required: true, dynamic: 'workspacesList.id.name', altersDynamicFields: true },
      { key: 'project_id', label: 'Project', type: 'string', required: true, dynamic: 'ProjectsList.id.name', altersDynamicFields: true },
      // { key: 'section_id', label: 'Section', type: 'string', required: false, dynamic: 'sectionsList.id.name' },
      { key: 'task_id', label: 'Task', type: 'string', required: true, dynamic: 'tasksList.id.name' },
      { key: 'completed', label: 'Mark as Complete', type: 'boolean', required: false },
      { key: 'title', label: 'Task Name', type: 'string', required: false },
      { key: 'assignee_id', label: 'Assignee', type: 'string', required: false, dynamic: 'usersList.id.name' },
      { key: 'due_at', label: 'Due at', type: 'datetime', required: false, helpText: 'Enter the due date and time, for example: 2026-08-20 15:30' },
      {
        key: 'start_at',
        label: 'Start at',
        type: 'datetime',
        required: false,
        helpText: 'Enter the start date and time, for example: 2026-08-20 15:30'
      },
      // { key: 'followers', label: 'Followers', type: 'string', list: true, required: false, dynamic: 'usersList.id.name' },
      { key: 'tags', label: 'Tags', type: 'string', list: true, required: false, dynamic: 'tagsList.id.name' },
      { key: 'description', label: 'Description', type: 'text', required: false },
      // { key: 'rich_text', label: 'Use Rich Text Formatting', type: 'boolean', required: false },
    ],
    perform,
    sample: {
      id: 'pending-sample',
      status: 'accepted',
      message: 'Task update request received and is being processed.',
      task_id: 520,
    },
  },
};