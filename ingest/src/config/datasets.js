const DEFAULT_BMF_URLS = [
  'https://www.irs.gov/pub/irs-soi/eo1.csv',
  'https://www.irs.gov/pub/irs-soi/eo2.csv',
  'https://www.irs.gov/pub/irs-soi/eo3.csv',
  'https://www.irs.gov/pub/irs-soi/eo4.csv'
];

const DEFAULT_PUB78_URL = 'https://www.irs.gov/pub/irs-soi/pub78.zip';
const DEFAULT_REVOCATIONS_URL = 'https://www.irs.gov/pub/irs-soi/eo_revocation.csv';
const DEFAULT_990N_URL = 'https://www.irs.gov/pub/irs-soi/eo_postcard.csv';

function parseListEnv(value) {
  if (!value) {
    return [];
  }
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getDatasets() {
  const bmfUrls = parseListEnv(process.env.BMF_URLS);

  return {
    bmf: {
      name: 'bmf',
      table: 'bmf_org',
      format: 'csv',
      urls: bmfUrls.length > 0 ? bmfUrls : DEFAULT_BMF_URLS
    },
    pub78: {
      name: 'pub78',
      table: 'pub78',
      format: 'pipe',
      url: process.env.PUB78_URL || DEFAULT_PUB78_URL,
      zipped: true
    },
    revocations: {
      name: 'revocations',
      table: 'revocations',
      format: 'pipe',
      url: process.env.REVOCATIONS_URL || DEFAULT_REVOCATIONS_URL,
      zipped: false
    },
    epostcard990n: {
      name: 'epostcard_990n',
      table: 'epostcard_990n',
      format: 'pipe',
      url: process.env.POSTCARD_990N_URL || DEFAULT_990N_URL,
      zipped: false
    }
  };
}
