'use strict';

// This function runs before every outbound request. You can have as many as
// you need. They'll each need to be registered in index.js's beforeRequest.
const includeBearerToken = (request, z, bundle) => {
  if (bundle.authData?.access_token) {
    request.headers = request.headers || {};
    request.headers.Authorization = `Bearer ${bundle.authData.access_token}`;
  }
  return request;
};

module.exports = { befores: [includeBearerToken], afters: [] };
