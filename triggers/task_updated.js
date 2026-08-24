'use strict';

const performSubscribe = async (z, bundle) => {
    z.console.log('===== SUBSCRIBE CALLED =====');
    z.console.log('INPUT DATA:', bundle.inputData);
    z.console.log('TARGET URL:', bundle.targetUrl);

    const response = await z.request({
        url: 'https://app.indev2.proofhub.com/oauth/ss_zapier/public/zapier/triggers/subscribe',
        method: 'POST',

        body: {
            event: 'task_updated',
            workspace_id: bundle.inputData.workspace_id,
            project_id: bundle.inputData.project_id,
            task_id: bundle.inputData.task_id,
            task_fields: bundle.inputData.taskFields,
            target_url: bundle.targetUrl,
        },
    });

    z.console.log('SUBSCRIBE RESPONSE:', response.data);

    response.throwForStatus();

    return response.data;
};

const performUnsubscribe = async (z, bundle) => {
    const subscriptionId = bundle.subscribeData.id;

    const response = await z.request({
        url: `https://app.indev2.proofhub.com/oauth/ss_zapier/public/zapier/triggers/subscribe/${subscriptionId}`,
        method: 'DELETE',
    });

    response.throwForStatus();

    return response.data;
};

const perform = async (z, bundle) => {
    const task = bundle.cleanedRequest;

    z.console.log('===== TASK UPDATED =====');
    z.console.log('Task:', task);

    return {
        id: String(task.id),
        name: task.name,
        description: task.description,

        workspace_id: String(task.workspace_id),
        project_id: String(task.project_id),

        status: task.status
            ? String(task.status)
            : undefined,

        updated_at: task.updated_at || undefined,
    };
};

const performList = async (z, bundle) => {
    const response = await z.request({
        url:
            'https://app.indev2.proofhub.com/oauth/ss_zapier/public/zapier/triggers/sample',

        method: 'GET',

        params: {
            event: 'task_updated',
            workspace_id: bundle.inputData.workspace_id,
            project_id: bundle.inputData.project_id,
        },
    });

    response.throwForStatus();

    const data = response.data;

    return Array.isArray(data)
        ? data
        : data.data || [];
};

module.exports = {
    key: 'task_updated',

    noun: 'Task',

    display: {
        label: 'Task Updated',
        description:
            'Triggers instantly when a task is updated in ProofHub.',
    },

    operation: {
        type: 'hook',

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
                altersDynamicFields: true,
            },

            {
                key: 'taskFields',
                label: 'Task Fields',
                type: 'string',
                list: true,
                required: true,
                dynamic: 'taskFields.id.name',
            },
        ],

        performSubscribe,

        performUnsubscribe,

        perform,

        performList,

        sample: {
            id: '101416',
            name: 'Sample Task',
            description: 'Sample description',
            workspace_id: '4598',
            project_id: '36290',
            status: 'open',
            updated_at: '2026-08-21T10:00:00Z',
        },
    },
};