from django.shortcuts import render
from django.views.generic import DetailView, ListView, TemplateView, CreateView, FormView
from .services import send_json_response

class VoterView(ListView):

    pass