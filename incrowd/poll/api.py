from __future__ import unicode_literals

from rest_framework import viewsets

from poll.models import Poll, Submission, Vote, PollSerializer, \
    SubmissionSerializer, VoteSerializer


class PollViewSet(viewsets.ReadOnlyModelViewSet):
    lookup_field = 'stub'
    serializer_class = PollSerializer
    queryset = Poll.objects.all()
    depth = 1


class VoteViewSet(viewsets.ModelViewSet):
    serializer_class = VoteSerializer

    def pre_save(self, obj):
        obj.user = self.request.user

    def get_queryset(self):
        return Vote.objects.filter(user=self.request.user)


class SubmissionViewSet(viewsets.ModelViewSet):
    serializer_class = SubmissionSerializer
    queryset = Submission.objects.all()

    def pre_save(self, obj):
        obj.user = self.request.user
