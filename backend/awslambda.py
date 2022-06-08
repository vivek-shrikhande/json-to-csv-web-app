import json

from converter import ConverterFactory


def handler(event, context):
    response = {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
        },
        "body": "",
        "isBase64Encoded": False
    }

    try:
        resp_str, headers = convert(event, context)
        response['headers'] = headers
        response['body'] = resp_str

    except Exception as e:
        print(e)
        response['body'] = json.dumps({'error': type(e).__name__, 'message': str(e)})
        response['statusCode'] = 400

    return response


def convert(event, context):
    method = event['requestContext']['http']['method']
    path = event['requestContext']['http']['path']

    if method != 'POST':
        raise ValueError(f"Method '{method}' not allowed!")

    if path != '/json-to-csv/convert':
        raise ValueError(f"Path '{path}' not found!")

    body = json.loads(event['body'])
    query_params = event['queryStringParameters']
    output_format = query_params.get('format', 'csv')
    skip_flattening = query_params.get('skip-flattening', False)
    download = query_params.get('download', False)

    print(f'Output Format = {output_format}\n'
          f'Skip flattening? = {skip_flattening}\n'
          f'Download = {download}')

    return ConverterFactory.supply(output_format,
                                   skip_flattening,
                                   download).convert(body)
