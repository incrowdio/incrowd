
class FormAPI(object):
    def __init__(self):
        self.serializers = {}

    def register(self, name, serializer):
        self.serializers[name] = serializer


api = FormAPI()