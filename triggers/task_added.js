'use strict';

const handleProofHubError = (z, response) => {
  const data = response.data || {};

  if (response.status === 422) {
    const validationMessage =
      data.errors &&
      Object.values(data.errors)
        .flat()
        .find((message) => message);

    throw new z.errors.Error(
      validationMessage || data.message || 'Validation failed.',
      'InvalidRequest'
    );
  }

  if (response.status < 200 || response.status >= 300) {
    throw new z.errors.Error(
      data.message || 'ProofHub request failed.',
      'InvalidRequest'
    );
  }
};

const performSubscribe = async (z, bundle) => {
  const response = await z.request({
    url: 'https://app.indev2.proofhub.com/oauth/ss_zapier/public/zapier/triggers/subscribe',
    method: 'POST',
    body: {
      event: 'task_added',
      wsid: bundle.inputData.wsid,
      project_id: bundle.inputData.project_id,
      url: bundle.targetUrl,
    },
    skipThrowForStatus: true,
  });

  z.console.log('SUBSCRIBE STATUS:', response.status);
  z.console.log('SUBSCRIBE RESPONSE:', response.data);

  handleProofHubError(z, response);

  return response.data;
};

const performUnsubscribe = async (z, bundle) => {
  const subscriptionId = bundle.subscribeData.id;

  const response = await z.request({
    url: `https://app.indev2.proofhub.com/oauth/ss_zapier/public/zapier/triggers/subscribe/${subscriptionId}`,
    method: 'DELETE',
    skipThrowForStatus: true,
  });

  z.console.log('UNSUBSCRIBE STATUS:', response.status);
  z.console.log('UNSUBSCRIBE RESPONSE:', response.data);

  handleProofHubError(z, response);

  return response.data;
};


const shapeTask = (raw = {}) => {
  const item = raw.item_json && typeof raw.item_json === 'object' ? raw.item_json : {};

  const rawId =
    raw.id != null ? raw.id : (raw.task_id != null ? raw.task_id : raw.item_id);

  return {
    ...raw,
    ...item,

    id: rawId != null ? String(rawId) : undefined,
    name: item.name ?? raw.name ?? undefined,
    description: item.description ?? raw.description ?? undefined,
    wsid: raw.wsid != null ? String(raw.wsid) : undefined,
    project_id: raw.project_id != null ? String(raw.project_id) : undefined,
  };
};

const perform = async (z, bundle) => {
  const raw = bundle.cleanedRequest || {};

  z.console.log('RAW TASK ADDED PAYLOAD:', JSON.stringify(raw));

  const shaped = shapeTask(raw);

  z.console.log('SHAPED TASK ADDED:', JSON.stringify(shaped));

  return [shaped];
};

const performList = async (z, bundle) => {
  const response = await z.request({
    url: 'https://app.indev2.proofhub.com/oauth/ss_zapier/public/zapier/triggers/',
    method: 'GET',
    params: {
      event: 'task_added',
      wsid: bundle.inputData.wsid,
      project_id: bundle.inputData.project_id,
    },
    skipThrowForStatus: true,
  });

  z.console.log('LIST STATUS:', response.status);
  z.console.log('LIST RESPONSE:', response.data);

  handleProofHubError(z, response);

  const data = response.data;
  const list = Array.isArray(data) ? data : data.data || data.original || [];

  return list.map(shapeTask);
};

module.exports = {
  key: 'task_added',
  noun: 'Task',

  display: {
    label: 'Task Added',
    description: 'Triggers instantly when a new task is added in ProofHub.',
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
      },
    ],

    performSubscribe,
    performUnsubscribe,
    perform,
    performList,

    sample: {
      id: '101416',
      name: 'Sample Task',
      description: 'Sample task',
      wsid: '4598',
      project_id: '36290',
      priority: 'normal',
      completed: false,
      created_at: '2026-08-31T07:51:05Z',
      updated_at: '2026-08-31T07:51:05Z',
    },


  },
};