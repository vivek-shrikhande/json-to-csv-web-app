const MAX_INPUT_SIZE = 2560000;
const BASE_URL = 'https://evf5ouvlgdqeex5x2ywh4zqpyq0dgrsz.lambda-url.ap-south-1.on.aws/json-to-csv'
const DOWNLOAD_URL = `${BASE_URL}/convert?format=csv&skip-flattening=true&download=true`
const CONVERT_URL = `${BASE_URL}/convert?format=json`
