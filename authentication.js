'use strict';

const BASE_URL =
  'https://app.indev2.proofhub.com/oauth/ss_zapier/public';

const TOKEN_URL = `${BASE_URL}/zapier/oauth/token-exchange`;
const AUTHORIZE_URL = `${BASE_URL}/zapier/oauth/connect-to-zapier`;
const ME_URL = `${BASE_URL}/zapier/me`;

const getAccessToken = async (z, bundle) => {
  z.console.log('Inside getAccessToken');
  z.console.log(bundle.inputData);

  const response = await z.request({
    url: TOKEN_URL,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: {
      client_id: bundle.inputData.client_id,
      client_secret: bundle.inputData.client_secret,
      grant_type: 'authorization_code',
      code: bundle.inputData.code,
      redirect_uri: bundle.inputData.redirect_uri,
      code_verifier: bundle.inputData.code_verifier,
    },
  });

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

  if (response.status !== 200) {
    throw new z.errors.RefreshAuthError();
  }

  return {
    access_token: response.data.access_token,
    refresh_token: response.data.refresh_token,
    expires_in: response.data.expires_in,
  };
};

const test = async (z, bundle) => {
  z.console.log('Calling ME endpoint...');
  z.console.log(bundle.authData);

  const response = await z.request({
    url: ME_URL,
    method: 'GET',
  });
  z.console.log(response.status);
  if (response.status !== 200) {
    throw new z.errors.RefreshAuthError();
  }

  return response.data;
};

const includeBearerToken = (request, z, bundle) => {
  if (bundle.authData?.access_token) {
    request.headers = request.headers || {};
    request.headers.Authorization = `Bearer ${bundle.authData.access_token}`;
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

    // Zapier generates PKCE automatically.
    // ProofHub validates the PKCE verifier during token exchange.
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