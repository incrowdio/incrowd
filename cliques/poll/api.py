from rest_framework import generics

from poll.models import Poll, Submission, Vote, PollSerializer, \
    SubmissionSerializer, VoteSerializer


class PollDetail(generics.RetrieveAPIView):
    lookup_field = 'stub'
    model = Poll
    serializer_class = PollSerializer
    depth = 1


class PollList(generics.ListCreateAPIView):
    model = Poll
    serializer_class = PollSerializer


class VoteList(generics.ListCreateAPIView):
    model = Vote
    serializer_class = VoteSerializer

    def pre_save(self, obj):
        obj.user = self.request.user

    def get_queryset(self):
        return Vote.objects.filter(user=self.request.user)


class VoteDetail(generics.RetrieveDestroyAPIView):
    model = Vote
    serializer_class = VoteSerializer

    def pre_save(self, obj):
        obj.user = self.request.user


class SubmissionDetail(generics.RetrieveDestroyAPIView):
    model = Submission
    serializer_class = SubmissionSerializer


class SubmissionList(generics.ListCreateAPIView):
    model = Submission
    serializer_class = SubmissionSerializer

    def pre_save(self, obj):
        obj.user = self.request.user
