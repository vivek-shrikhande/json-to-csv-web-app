import io
import uuid
from csv import DictWriter as CsvDictWriter

from jsonflat import JsonFlat


class Converter:
    def __init__(self, skip_flattening, download):
        self.skip_flattening = skip_flattening
        self.download = download
        self.headers = dict()
        if download:
            content_disposition = f'attachment; filename="{str(uuid.uuid4())}.csv"'
            self.headers['Content-Disposition'] = content_disposition
            self.headers['Access-Control-Expose-Headers'] = 'Content-Disposition'

    def convert(self, input_data):
        if not self.skip_flattening:
            input_data = JsonFlat().flatten(input_data)
        return input_data, self.headers


class CsvConverter(Converter):
    def convert(self, input_data: dict):
        flattened, _ = super().convert(input_data)
        f = io.StringIO()

        writer = CsvDictWriter(f,
                               fieldnames=flattened['field_names'],
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
