'use strict';

const listTasks = async (z, bundle) => {
  const response = await z.request({
    url: 'https://app.indev2.proofhub.com/oauth/ss_zapier/public/zapier/search',
    method: 'GET',
    params: {
      type: 'tasks',
      workspace_id: bundle.inputData.workspace_id,
      project_id: bundle.inputData.project_id,
    },
  });

  return response.data;
};

module.exports = {
  key: 'new_task',
  noun: 'Task',
  display: {
    label: 'New Task',
    description: 'Triggers when a new task is added to a project.',   // "Triggers when" se start hona chahiye
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
      },
    ],
    perform: listTasks,
    sample: {
      id: 101,
      title: 'Sample Task',
      description: 'Sample description',
      created_at: '2026-08-11T10:00:00Z',
      created_by: 'John Doe',
      project_id: 1,
      project_name: 'Sample Project',
      workspace_id: 4598,
      url: 'https://app.indev2.proofhub.com/tasks/101',
    },
    outputFields: [
      { key: 'id', label: 'Task ID', type: 'integer' },
      { key: 'title', label: 'Task Title', type: 'string' },
      { key: 'description', label: 'Description', type: 'string' },
      { key: 'created_at', label: 'Created At', type: 'datetime' },
      { key: 'created_by', label: 'Created By', type: 'string' },
      { key: 'project_name', label: 'Project Name', type: 'string' },
      { key: 'url', label: 'Task URL', type: 'string' },
    ],
  },
};