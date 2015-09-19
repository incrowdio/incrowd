from __future__ import unicode_literals
import logging

from rest_framework import viewsets
from plugins.fantasy.models import FantasyProfile, FantasyProfileSerializer

logger = logging.getLogger(__name__)


class FantasyProfileViewSet(viewsets.ModelViewSet):
    model = FantasyProfile
    serializer_class = FantasyProfileSerializer
    paginate_by = 10
    paginate_by_param = 'num_profiles'
    max_paginate_by = 100
