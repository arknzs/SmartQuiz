from django import forms

from .models import Voter


class VoterForm(forms.Form):
    class Meta:
        model = Voter
        fields = ['answer']