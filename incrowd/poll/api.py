from __future__ import unicode_literals

from rest_framework import viewsets

from poll.models import Poll, Submission, Vote, PollSerializer, \
    SubmissionSerializer, VoteSerializer


class PollViewSet(viewsets.ReadOnlyModelViewSet):
    lookup_field = 'stub'
    serializer_class = PollSerializer
    queryset = Poll.objects.all()
    depth = 1

    def perform_create(self, serializer):
        serializer.save(user=self.request.user,
                        crowd=self.request.user.crowd)


class VoteViewSet(viewsets.ModelViewSet):
    serializer_class = VoteSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user,
                        crowd=self.request.user.crowd)

    def get_queryset(self):
        return Vote.objects.filter(user=self.request.user)


class SubmissionViewSet(viewsets.ModelViewSet):
    serializer_class = SubmissionSerializer
    queryset = Submission.objects.all()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user,
                        crowd=self.request.user.crowd)
