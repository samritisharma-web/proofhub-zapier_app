'use strict';

const PROOFHUB_BASE_URL =
  'https://app.indev2.proofhub.com/oauth/ss_zapier/public';

/**
 * Subscribe Zapier to ProofHub completed-task webhook.
 */
const performSubscribe = async (z, bundle) => {
  z.console.log('===== TASK COMPLETED SUBSCRIBE CALLED =====');
  z.console.log(
    'INPUT DATA:',
    JSON.stringify(bundle.inputData)
  );
  z.console.log(
    'TARGET URL:',
    bundle.targetUrl
  );

  const response = await z.request({
    url: `${PROOFHUB_BASE_URL}/zapier/triggers/subscribe`,
    method: 'POST',

    body: {
      event: 'completed_task',
      wsid: bundle.inputData.wsid,
      project_id: bundle.inputData.project_id,
      url: bundle.targetUrl,
    },
  });

  z.console.log(
    'TASK COMPLETED SUBSCRIBE STATUS:',
    response.status
  );

  z.console.log(
    'TASK COMPLETED SUBSCRIBE RESPONSE:',
    JSON.stringify(response.data)
  );

  response.throwForStatus();

  return response.data;
};


/**
 * Unsubscribe Zapier webhook from ProofHub.
 */
const performUnsubscribe = async (z, bundle) => {
  const subscriptionId =
    bundle.subscribeData &&
    bundle.subscribeData.id;

  z.console.log(
    '===== TASK COMPLETED UNSUBSCRIBE =====',
    subscriptionId
  );

  if (!subscriptionId) {
    z.console.log(
      'No subscription ID found. Nothing to unsubscribe.'
    );

    return {};
  }

  const response = await z.request({
    url: `${PROOFHUB_BASE_URL}/zapier/triggers/subscribe/${subscriptionId}`,
    method: 'DELETE',
  });

  z.console.log(
    'UNSUBSCRIBE STATUS:',
    response.status
  );

  response.throwForStatus();

  return response.data;
};


/**
 * Get item_json safely.
 *
 * ProofHub webhook can look like:
 *
 * {
 *   item_id: 123,
 *   item_json: {
 *     name: "...",
 *     description: "...",
 *     completed: true
 *   }
 * }
 */
const getItem = (raw = {}) => {
  return raw.item_json &&
    typeof raw.item_json === 'object'
    ? raw.item_json
    : {};
};


/**
 * Check whether task is completed.
 */
const isCompleted = (raw = {}) => {
  const item = getItem(raw);

  return (
    item.completed === true ||
    item.completed === 1 ||
    item.completed === '1' ||
    item.completed === 'true' ||

    raw.completed === true ||
    raw.completed === 1 ||
    raw.completed === '1' ||
    raw.completed === 'true'
  );
};


/**
 * Convert ProofHub response into Zapier task structure.
 *
 * Everything here is dynamic.
 * Nothing is hardcoded.
 */
const shapeTask = (raw = {}) => {
  const item = getItem(raw);

  const rawId =
    raw.item_id ??
    raw.task_id ??
    raw.id ??
    item.id;

  const completed = isCompleted(raw);

  const task = {
    id:
      rawId != null
        ? String(rawId)
        : undefined,

    task_id:
      rawId != null
        ? String(rawId)
        : undefined,

    name:
      item.name ??
      item.title ??
      raw.name ??
      raw.title ??
      undefined,

    description:
      item.description ??
      raw.description ??
      undefined,

    wsid:
      raw.wsid != null
        ? String(raw.wsid)
        : undefined,

    project_id:
      raw.project_id != null
        ? String(raw.project_id)
        : undefined,

    status:
      completed
        ? 'completed'
        : (
            raw.status ??
            item.status ??
            undefined
          ),

    completed_at:
      raw.completed_at ??
      item.completed_at ??
      (
        completed
          ? raw.last_activity_at
          : undefined
      ),

    updated_at:
      raw.last_activity_at ??
      raw.updated_at ??
      item.updated_at ??
      undefined,
  };

  return task;
};


/**
 * REAL WEBHOOK HANDLER
 *
 * This is called when ProofHub actually sends:
 *
 * ProofHub
 *    ↓
 * Zapier webhook
 *    ↓
 * bundle.cleanedRequest
 *    ↓
 * perform()
 */
const perform = async (z, bundle) => {
  const raw = bundle.cleanedRequest || {};

  z.console.log(
    '===== TASK COMPLETED WEBHOOK RECEIVED ====='
  );

  z.console.log(
    'RAW WEBHOOK DATA:',
    JSON.stringify(raw)
  );

  const shaped = shapeTask(raw);

  z.console.log(
    'SHAPED TASK DATA:',
    JSON.stringify(shaped)
  );

  return [shaped];
};


/**
 * TEST / POLLING DATA
 *
 * Zapier uses this when you click:
 *
 * Test Trigger
 *
 * It calls ProofHub and gets actual completed tasks.
 */
const performList = async (z, bundle) => {
  z.console.log(
    '===== TASK COMPLETED PERFORM LIST CALLED ====='
  );

  z.console.log(
    'INPUT DATA:',
    JSON.stringify(bundle.inputData)
  );

  const params = {
    event: 'completed_task',
  };

  /**
   * Only send wsid when selected.
   */
  if (bundle.inputData.wsid) {
    params.wsid = bundle.inputData.wsid;
  }

  /**
   * Only send project_id when selected.
   */
  if (bundle.inputData.project_id) {
    params.project_id =
      bundle.inputData.project_id;
  }

  z.console.log(
    'REQUEST PARAMS:',
    JSON.stringify(params)
  );

  const response = await z.request({
    url: `${PROOFHUB_BASE_URL}/zapier/triggers`,
    method: 'GET',
    params,
  });

  z.console.log(
    'PERFORM LIST STATUS:',
    response.status
  );

  response.throwForStatus();

  const data = response.data;

  z.console.log(
    '===== RAW PROOFHUB TEST RESPONSE =====',
    JSON.stringify(data)
  );

  /**
   * Handle both possible response formats:
   *
   * 1. [
   *      {...},
   *      {...}
   *    ]
   *
   * 2. {
   *      data: [
   *        {...},
   *        {...}
   *      ]
   *    }
   */
  let list = [];

  if (Array.isArray(data)) {
    list = data;
  } else if (
    data &&
    Array.isArray(data.data)
  ) {
    list = data.data;
  } else if (
    data &&
    Array.isArray(data.original)
  ) {
    list = data.original;
  }

  z.console.log(
    'NORMALIZED PROOFHUB RECORDS:',
    JSON.stringify(list)
  );

  /**
   * Keep only completed tasks.
   */
  const completedTasks = list
    .filter(isCompleted)
    .map(shapeTask);

  z.console.log(
    '===== COMPLETED TASKS FOR ZAPIER TEST =====',
    JSON.stringify(completedTasks)
  );

  return completedTasks;
};


module.exports = {
  key: 'task_completed',

  noun: 'Task',

  display: {
    label: 'Task Completed',

    description:
      'Triggers instantly when a task is completed in ProofHub.',
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
    ],

    performSubscribe,

    performUnsubscribe,

    perform,

    performList,

    /**
     * IMPORTANT:
     *
     * No hardcoded sample object here.
     *
     * Zapier Test Trigger should get its
     * records from performList().
     */

    outputFields: [
      {
        key: 'id',
        label: 'Task ID',
        type: 'string',
      },

      {
        key: 'task_id',
        label: 'Task ID',
        type: 'string',
      },

      {
        key: 'name',
        label: 'Task Name',
        type: 'string',
      },

      {
        key: 'description',
        label: 'Description',
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
        key: 'status',
        label: 'Status',
        type: 'string',
      },

      {
        key: 'completed_at',
        label: 'Completed At',
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