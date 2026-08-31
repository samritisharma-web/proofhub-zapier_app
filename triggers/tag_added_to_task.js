'use strict';

const performSubscribe = async (z, bundle) => {
    z.console.log('===== TAG ADDED TO TASK SUBSCRIBE CALLED =====');
    z.console.log('INPUT DATA:', bundle.inputData);
    z.console.log('TARGET URL:', bundle.targetUrl);

    const response = await z.request({
        url: 'https://app.indev2.proofhub.com/oauth/ss_zapier/public/zapier/triggers/subscribe',
        method: 'POST',

        body: {
            event: 'tag_added_to_task',
            wsid: bundle.inputData.wsid,
            project_id: bundle.inputData.project_id,
            task_id: bundle.inputData.task_id,
            url: bundle.targetUrl,
        },
    });

    z.console.log(
        'TAG ADDED TO TASK SUBSCRIBE RESPONSE:',
        response.data
    );

    response.throwForStatus();

    return response.data;
};

const performUnsubscribe = async (z, bundle) => {
    const subscriptionId = bundle.subscribeData.id;

    z.console.log(
        '===== TAG ADDED TO TASK UNSUBSCRIBE =====',
        subscriptionId
    );

    const response = await z.request({
        url: `https://app.indev2.proofhub.com/oauth/ss_zapier/public/zapier/triggers/subscribe/${subscriptionId}`,
        method: 'DELETE',
    });

    response.throwForStatus();

    return response.data;
};

const perform = async (z, bundle) => {
    const task = bundle.cleanedRequest;

    z.console.log('===== TAG ADDED TO TASK =====');
    z.console.log('Task:', task);

    return {
        id: String(task.id || task.task_id),

        name: task.name,

        description: task.description,

        wsid: task.wsid
            ? String(task.wsid)
            : undefined,

        project_id: task.project_id
            ? String(task.project_id)
            : undefined,

        task_id: task.task_id
            ? String(task.task_id)
            : task.id
                ? String(task.id)
                : undefined,

        tag_id: task.tag_id
            ? String(task.tag_id)
            : undefined,

        tag_name: task.tag_name || undefined,

        updated_at: task.updated_at || undefined,
    };
};

const performList = async (z, bundle) => {
    const response = await z.request({
        url:
            'https://app.indev2.proofhub.com/oauth/ss_zapier/public/zapier/triggers',

        method: 'GET',

        params: {
            event: 'tag_added_to_task',
            wsid: bundle.inputData.wsid,
            project_id: bundle.inputData.project_id,
            task_id: bundle.inputData.task_id,
            tags: bundle.inputData.tags,
        },
    });

    response.throwForStatus();

    const data = response.data;

    return Array.isArray(data)
        ? data
        : data.data || [];
};

module.exports = {
    key: 'tag_added_to_task',

    noun: 'Task',

    display: {
        label: 'Tag Added to Task',
        description:
            'Triggers instantly when a tag is added to a task in ProofHub.',
    },

    operation: {
        type: 'hook',

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
                label: 'Task',
                type: 'string',
                required: true,
                dynamic: 'tasksList.id.name',
            },

            {
                key: 'tag_id',
                label: 'Tag',
                type: 'string',
                required: false,
                dynamic: 'tagsList.id.name',
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
            wsid: '4598',
            project_id: '36290',
            task_id: '101416',
            tag_id: '501',
            tag_name: 'Important',
            updated_at: '2026-08-21T10:00:00Z',
        },

        outputFields: [
            {
                key: 'id',
                label: 'Task ID',
                type: 'string',
            },
            {
                key: 'name',
                label: 'Task Name',
                type: 'string',
            },
            {
                key: 'wsid',
                label: 'Workspace ID',
                type: 'string',
            },
            {
                key: 'project_id',
                label: 'Project ID',
                type: 'string',
            },
            {
                key: 'task_id',
                label: 'Task ID',
                type: 'string',
            },
            {
                key: 'tag_id',
                label: 'Tag ID',
                type: 'string',
            },
            {
                key: 'tag_name',
                label: 'Tag Name',
                type: 'string',
            },
            {
                key: 'updated_at',
                label: 'Updated At',
                type: 'string',
            },
        ],
    },
};