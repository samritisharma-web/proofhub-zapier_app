'use strict';

const requestAction = async (z, action, body) => {
  let response;

  try {
    response = await z.request({
      url: 'https://app.indev2.proofhub.com/oauth/ss_zapier/public/zapier/action',
      method: 'POST',
      body: { action, ...body },
    });
  } catch (err) {
    throw new z.errors.Error(`Request to ProofHub failed: ${err.message}`, 'RequestError', err.status || 500);
  }

  if (!response || !response.status) {
    throw new z.errors.Error('No response received from ProofHub.', 'NoResponseError', 500);
  }

  if (response.status >= 400) {
    throw new z.errors.Error(response.data?.error || `Failed to perform ${action}.`, 'ActionError', response.status);
  }

  return response.data;
};

module.exports = { requestAction };