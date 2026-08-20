'use strict';

const listSections = async (z, bundle) => {
  z.console.log(
    'SECTION INPUT:',
    JSON.stringify(bundle.inputData)
  );

  const response = await z.request({
    url: 'https://app.indev2.proofhub.com/oauth/ss_zapier/public/zapier/search',
    method: 'GET',
    params: {
      type: 'sections',
      workspace_id: bundle.inputData.workspace_id,
      project_id: bundle.inputData.project_id,
    },
  });

  z.console.log(
    'SECTION RESPONSE:',
    JSON.stringify(response.data)
  );

  // Backend wraps the payload as { headers, original, exception }.
  // Fall back to other common shapes in case the API response format changes.
  const sections = response.data.original || response.data.data || response.data;

  if (!Array.isArray(sections)) {
    throw new z.errors.Error(
      `Unexpected sections response shape: ${JSON.stringify(response.data)}`,
      'InvalidResponse',
      500
    );
  }

  return sections.map((section) => ({
    id: String(section.id),
    name: section.name,
  }));
};

module.exports = {
  key: 'sectionsList',
  noun: 'Section',

  list: {
    display: {
      label: 'Sections',
      description: 'Lists sections for the selected project.',
      hidden: true,
    },

    operation: {
      perform: listSections,
      sample: {
        id: '62765',
        name: 'Untitled',
      },
    },
  },
};