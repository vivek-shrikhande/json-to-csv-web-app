import io
import uuid
from csv import DictWriter as CsvDictWriter

from flask import Flask, url_for
from flask import request
from flask_cors import CORS

from jsonflat import JsonFlat
from .converter import ConverterFactory

app = Flask(__name__)
CORS(app)

# todo: handle boolean csv values

@app.route('/json-to-csv/convert', methods=['POST'])
def convert():
    try:
        body = request.json
        output_format = request.args.get('format', 'csv')
        skip_flattening = request.args.get('skip-flattening', False)
        download = request.args.get('download', False)

        app.logger.info(f'Output Format = {output_format}\n'
                        f'Skip flattening? = {skip_flattening}\n'
                        f'Download = {download}')

        return ConverterFactory.supply(output_format,
                                       skip_flattening,
                                       download).convert(body)

    except Exception as e:
        app.logger.exception('Error')
        return {'error': type(e).__name__, 'message': str(e)}, 400
