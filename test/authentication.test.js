/* globals describe, it, expect, beforeAll */

const zapier = require('zapier-platform-core');

zapier.tools.env.inject();

const App = require('../index');
const appTester = zapier.createAppTester(App);

const CLIENT_ID = process.env.CLIENT_ID || '1234';
const CLIENT_SECRET = process.env.CLIENT_SECRET || 'asdf';

const REDIRECT_URI =
  'https://zapier.com/dashboard/auth/oauth/return/App244413CLIAPI/';

describe('OAuth2 Authentication', () => {
  beforeAll(() => {
    if (!(CLIENT_ID && CLIENT_SECRET)) {
      throw new Error(
        'CLIENT_ID and CLIENT_SECRET must be available before running authentication tests.'
      );
    }
  });

  describe('Authorize URL', () => {
    it('generates the correct authorize URL', async () => {
      const bundle = {
        inputData: {
          state: '4444',
          redirect_uri: REDIRECT_URI,
        },
        environment: {
          CLIENT_ID,
          CLIENT_SECRET,
        },
      };

      const authorizeUrl = await appTester(
        App.authentication.oauth2Config.authorizeUrl,
        bundle
      );

      expect(authorizeUrl).toBe(
        `https://app.indev2.proofhub.com/oauth/ss_zapier/public/oauth/connect-to-zapier?redirect_uri=${encodeURIComponent(
          REDIRECT_URI
        )}&state=4444`
      );
    });
  });

  describe('Access Token', () => {
    it('fetches an access token using a valid authorization code', async () => {
      if (!process.env.TEST_AUTH_CODE) {
        console.warn('Skipping access token test (TEST_AUTH_CODE not configured).');
        return;
      }

      const bundle = {
        inputData: {
          code: process.env.TEST_AUTH_CODE,
          redirect_uri: REDIRECT_URI,
          code_verifier: process.env.TEST_CODE_VERIFIER,
        },
        environment: {
          CLIENT_ID,
          CLIENT_SECRET,
        },
      };

      const result = await appTester(
        App.authentication.oauth2Config.getAccessToken,
        bundle
      );

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
    });
  });

  describe('Refresh Token', () => {
    it('refreshes an expired access token', async () => {
      if (!process.env.TEST_REFRESH_TOKEN) {
        console.warn('Skipping refresh token test (TEST_REFRESH_TOKEN not configured).');
        return;
      }

      const bundle = {
        authData: {
          refresh_token: process.env.TEST_REFRESH_TOKEN,
        },
        environment: {
          CLIENT_ID,
          CLIENT_SECRET,
        },
      };

      const result = await appTester(
        App.authentication.oauth2Config.refreshAccessToken,
        bundle
      );

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
    });
  });

  describe('Authenticated Request', () => {
    it('includes the access token in authenticated requests', async () => {
      if (!process.env.TEST_ACCESS_TOKEN) {
        console.warn('Skipping authenticated request test (TEST_ACCESS_TOKEN not configured).');
        return;
      }

      const bundle = {
        authData: {
          access_token: process.env.TEST_ACCESS_TOKEN,
        },
      };

      const response = await appTester(
        App.authentication.test,
        bundle
      );

      expect(response.data).toHaveProperty('workspace_name');
      expect(response.data).toHaveProperty('user_name');
      expect(response.data).toHaveProperty('user_email');
    });
  });
});