from rest_framework.response import Response
from rest_framework import status


def api_response(success=True, message="", data=None, http_status=status.HTTP_200_OK):
    """Standardized JSON API response structure."""
    payload = {
        "success": success,
        "message": message,
    }
    if data is not None:
        payload["data"] = data
    return Response(payload, status=http_status)
