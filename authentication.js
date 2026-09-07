'use strict';

const BASE_URL =
  'https://app.indev2.proofhub.com/oauth/ss_zapier/public';

const TOKEN_URL = `${BASE_URL}/zapier/oauth/token-exchange`;
const AUTHORIZE_URL = `${BASE_URL}/zapier/oauth/connect-to-zapier`;
const ME_URL = `${BASE_URL}/zapier/me`;

const getAccessToken = async (z, bundle) => {
  z.console.log('Inside getAccessToken');
  z.console.log('Authorization code received');

  const response = await z.request({
    url: TOKEN_URL,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: {
      client_id: bundle.environment.CLIENT_ID,
      client_secret: bundle.environment.CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: bundle.inputData.code,
      redirect_uri: bundle.inputData.redirect_uri,
      code_verifier: bundle.inputData.code_verifier,
    },
  });

  z.console.log('TOKEN RESPONSE STATUS:', response.status);
  z.console.log('TOKEN RESPONSE DATA:', response.data);

  if (response.status !== 200) {
    throw new z.errors.Error(
      response.data?.error_description ||
        response.data?.error ||
        'Authentication failed',
      response.data?.error || 'AuthError',
      response.status
    );
  }

  return {
    access_token: response.data.access_token,
    refresh_token: response.data.refresh_token,
    expires_in: response.data.expires_in,
  };
};

const refreshAccessToken = async (z, bundle) => {
  z.console.log('Refreshing ProofHub access token');

  const response = await z.request({
    url: TOKEN_URL,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: {
      client_id: bundle.environment.CLIENT_ID,
      client_secret: bundle.environment.CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: bundle.authData.refresh_token,
    },
  });

  z.console.log('REFRESH STATUS:', response.status);

  if (response.status !== 200) {
    throw new z.errors.RefreshAuthError(
      'Unable to refresh ProofHub access token'
    );
  }

  return {
    access_token: response.data.access_token,
    refresh_token:
      response.data.refresh_token || bundle.authData.refresh_token,
    expires_in: response.data.expires_in,
  };
};

const test = async (z, bundle) => {
  z.console.log('Calling ProofHub ME endpoint');

  const response = await z.request({
    url: ME_URL,
    method: 'GET',
  });

  z.console.log('ME STATUS:', response.status);
  z.console.log('ME RESPONSE:', response.data);

  if (response.status !== 200) {
    throw new z.errors.RefreshAuthError(
      'ProofHub authentication failed'
    );
  }

  return response.data;
};

const includeBearerToken = (request, z, bundle) => {
  if (bundle.authData?.access_token) {
    request.headers = request.headers || {};

    request.headers.Authorization =
      `Bearer ${bundle.authData.access_token}`;
  }

  return request;
};

const authentication = {
  type: 'oauth2',

  oauth2Config: {
    authorizeUrl: {
      url: AUTHORIZE_URL,
      params: {
        redirect_uri: '{{bundle.inputData.redirect_uri}}',
        state: '{{bundle.inputData.state}}',
      },
    },

    getAccessToken,

    refreshAccessToken,

    autoRefresh: true,

    enablePkce: true,
  },

  fields: [],

  test,

  connectionLabel: 'ProofHub - {{bundle.inputData.user_email}}',
};

module.exports = {
  authentication,
  includeBearerToken,
};