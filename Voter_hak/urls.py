"""
URL configuration for Voter_hak project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path

import Voter_hak.settings as settings
from apps.voter import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('quiz/', views.quiz_page, name='quiz_page'),
    path('api/quiz/blocks/', views.api_get_blocks, name='api_get_blocks'),
    path('api/quiz/submit/', views.api_submit_quiz, name='api_submit_quiz'),
]
if settings.DEBUG:
    from django.conf.urls.static import static
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )