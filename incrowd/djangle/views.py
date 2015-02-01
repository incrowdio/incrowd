from __future__ import unicode_literals
import json

from django.http import HttpResponse

from djangle import form_api


additional_field_attrs = {
    'string': ['max_length', 'min_length'],
    'datetime': [],
    'date': [],
    'url': [],
    'choice': ['choices']
}


def render_serializers(request, name=None):
    api = form_api.api
    response = {}
    for name, serializer in api.serializers.items():
        instance = serializer()
        response[name] = {
            'title': name,
            'fields': _get_fields(instance),
        }
    return HttpResponse(json.dumps(response), content_type="application/json")


def _get_fields(instance):
    fields = []
    for field_name, field in instance.fields.items():
        f = {'name': field_name}

        # print 'FIELDNAME', type(field), field_name, dir(field)
        for attr in ['help_text', 'required', 'label',
                     'read_only', 'default', 'type_name']:
            a = getattr(field, attr, None)
            # Force evalutation of lazy translations
            f[attr] = unicode(a)

        # Add field specific additional fields
        for attr in additional_field_attrs.get(field.type_label, []):
            f[attr] = getattr(field, attr)

        fields.append(f)
    return fields
