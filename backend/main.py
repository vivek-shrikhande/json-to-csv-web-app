import io
import uuid
from csv import DictWriter as CsvDictWriter

from flask import Flask, url_for
from flask import request
from flask_cors import CORS

from jsonflat import JsonFlat

app = Flask(__name__)
CORS(app)

# todo: handle boolean csv values

@app.route('/json-to-csv/convert', methods=['POST'])
def kibis_convert():
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


class Converter:
    def __init__(self, skip_flattening, download):
        self.skip_flattening = skip_flattening
        self.download = download
        self.headers = dict()
        if download:
            self.headers['Content-Disposition'] = (f'attachment; filename="'
                                                   f'{str(uuid.uuid4())}.csv"')
            self.headers['Access-Control-Expose-Headers'] = (
                'Content-Disposition')

    def convert(self, input_data):
        if not self.skip_flattening:
            input_data = JsonFlat().flatten(input_data)
        return input_data, self.headers


class CsvConverter(Converter):
    def convert(self, input_data: dict):
        flattened, _ = super().convert(input_data)
        f = io.StringIO()

        writer = CsvDictWriter(f, fieldnames=flattened['field_names'],
                               extrasaction='ignore')
        writer.writeheader()
        writer.writerows(flattened['rows'])

        csv_string = f.getvalue()
        f.close()

        self.headers['Content-Type'] = 'application/csv'
        return csv_string, self.headers


class ConverterFactory:
    @staticmethod
    def supply(output_format, skip_flattening, download):
        if output_format == 'json':
            return Converter(skip_flattening, download)
        elif output_format == 'csv':
            return CsvConverter(skip_flattening, download)
        else:
            raise ValueError('Unknown format')
