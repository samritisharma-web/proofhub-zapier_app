'use strict';

const listTasks = async (z, bundle) => {
  const response = await z.request({
    url: 'https://app.indev2.proofhub.com/oauth/ss_zapier/public/zapier/search',
    method: 'GET',
    params: {
      type: 'tasks',
      wsid: bundle.inputData.wsid,
      project_id: bundle.inputData.project_id,
      task_id: bundle.inputData.task_id,
    },
  });

  return response.data.original.map((task) => ({
    id: String(task.id),
    name: task.name,
  }));
};

module.exports = {
  key: 'tasks',
  noun: 'Task',

  list: {
    display: {
      label: 'Find Task',
      description: 'Search for tasks.',
      hidden: true,
    },

    operation: {
      perform: listTasks,

      sample: {
        id: '725',
        name: 'new task to test zap trigger15',
      },
    },
  },
};