from django.template.response import TemplateResponse


def index(request):
    """メイン画面."""
    return TemplateResponse(request, '../templates/base.html')