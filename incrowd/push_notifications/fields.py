import re
import struct
from django import forms
from django.core.validators import RegexValidator
from django.db import models, connection
from django.utils import six
from django.utils.translation import ugettext_lazy as _


__all__ = ["HexadecimalField", "HexIntegerField"]


hex_re = re.compile(r"^[0-9A-f]+$")
postgres_engines = [
    "django.db.backends.postgresql_psycopg2",
    "django.contrib.gis.db.backends.postgis",
]


class HexadecimalField(forms.CharField):
    """
    A form field that accepts only hexadecimal numbers
    """
    def __init__(self, *args, **kwargs):
        self.default_validators = [RegexValidator(hex_re, _("Enter a valid hexadecimal number"), "invalid")]
        super(HexadecimalField, self).__init__(*args, **kwargs)


class HexIntegerField(models.CharField):
    """
    This field stores a hexadecimal *string* of up to 64 bits as an unsigned integer
    on *all* backends including postgres.

    Reasoning: Postgres only supports signed bigints. Since we don't care about
    signedness, we store it as signed, and cast it to unsigned when we deal with
    the actual value (with struct)

    On sqlite and mysql, native unsigned bigint types are used. In all cases, the
    value we deal with in python is always in hex.
    """
    def __init__(self, *args, **kwargs):
        self.max_length = 16
        super(HexIntegerField, self).__init__(*args, **kwargs)

    # def db_type(self, connection):
    #     engine = connection.settings_dict["ENGINE"]
    #     if "mysql" in engine:
    #         return "bigint unsigned"
    #     elif "sqlite" in engine:
    #         return "TEXT"
    #     else:
    #         return super(HexIntegerField, self).db_type(connection=connection)

    def get_prep_value(self, value):
        if value is None or value == "":
            return None
        else:
            return str(value)
        # if isinstance(value, six.string_types):
        #     value = int(value, 16)
        # # on postgres only, interpret as signed
        # if connection.settings_dict["ENGINE"] in postgres_engines:
        #     value = struct.unpack("q", struct.pack("Q", value))[0]
        # # elif "sqlite" in connection.settings_dict["ENGINE"]:
        # #     value = hex(int(value))
        # return value

    def to_python(self, value):
        if isinstance(value, six.string_types):
            return value
        if value is None:
            return ""
        return str(value)
        # # on postgres only, re-interpret from signed to unsigned
        # if connection.settings_dict["ENGINE"] in postgres_engines:
        #     value = hex(struct.unpack("Q", struct.pack("q", value))[0])
        # elif "sqlite" in connection.settings_dict["ENGINE"]:
        #     value = str(value)
        #
        # return value

    def formfield(self, **kwargs):
        defaults = {"form_class": HexadecimalField}
        # defaults = {'min_value': 0,
        #             'max_value': models.BigIntegerField.MAX_BIGINT ** 2 - 1}
        defaults.update(kwargs)
        return super(HexIntegerField, self).formfield(**defaults)
