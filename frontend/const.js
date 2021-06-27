const MAX_INPUT_SIZE = 2560000;
const BASE_URL = 'http://localhost:5000/kibis'
const DOWNLOAD_URL = `${BASE_URL}/convert?format=csv&skip-flattening=true&download=true`
const CONVERT_URL = `${BASE_URL}/convert?format=json`
