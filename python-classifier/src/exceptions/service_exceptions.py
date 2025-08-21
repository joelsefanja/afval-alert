"""Service-specific Exception Classes"""

from .base_exceptions import AfvalAlertError


class ServiceNotAvailableError(AfvalAlertError):
    """Service niet beschikbaar"""

    pass
