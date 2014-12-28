from rest_framework import serializers

from invite_only.models import InviteCode
from website.models import UserSerializer


class InviteCodeSerializer(serializers.ModelSerializer):
    invited_by = UserSerializer(read_only=True)
    code = serializers.CharField(read_only=True)
    user = serializers.BooleanField(default=False)

    class Meta:
        model = InviteCode
        fields = ('id', 'invited_by', 'code', 'used', 'invited_email',
                  'invited_name')

        depth = 1
