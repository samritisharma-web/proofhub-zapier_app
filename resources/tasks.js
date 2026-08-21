'use strict';

const listTasks = async (z, bundle) => {
  z.console.log('DEBUG bundle.inputData:', JSON.stringify(bundle.inputData));
  const response = await z.request({
    url: 'https://app.indev2.proofhub.com/oauth/ss_zapier/public/zapier/search',
    method: 'GET',
    params: {
      type: 'tasks',
      workspace_id: bundle.inputData.workspace_id,
      project_id: bundle.inputData.project_id,
      task_id: bundle.inputData.task_id,
    },
  });

  return response.data.data.map((t) => ({
    id: t.task_id,
    name: t.name,
  }));
};

module.exports = {
  key: 'tasks',
  noun: 'Task',
  list: {
    display: {
      label: 'New Task',
      description: 'Lists tasks for dropdown.',
      hidden: true,
    },
    operation: {
      perform: listTasks,
      sample: { id: 520, name: 'Sample Task' },
    },
  },
};