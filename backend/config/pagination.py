from rest_framework.pagination import PageNumberPagination


class StandardResultsSetPagination(PageNumberPagination):
    """Small, predictable page responses for the portal's collection APIs."""

    page_size = 12
    page_size_query_param = "page_size"
    max_page_size = 100
