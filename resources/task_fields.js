'use strict';

const taskFieldsList = async (z, bundle) => {

    const response = await z.request({
        url: 'https://app.indev2.proofhub.com/oauth/ss_zapier/public/zapier/search',
        method: 'GET',

        params: {
            type: 'task_fields',
            workspace_id: bundle.inputData.workspace_id,
            project_id: bundle.inputData.project_id,
            task_id: bundle.inputData.task_id,
        },
    });

    response.throwForStatus();

    const fields = response.data.data || [];

    z.console.log('Task fields:', fields);

    return fields.map(field => ({
        id: field.key,
        name: field.label,
    }));
};

module.exports = {
    key: 'taskFields',
    noun: 'Task Field',

    list: {
        display: {
            label: 'Task Fields',
            description: 'Returns the fields available for a task.',
        },

        operation: {
            perform: taskFieldsList,

            sample: {
                id: 'name',
                name: 'Task Name',
            },
        },
    },
};