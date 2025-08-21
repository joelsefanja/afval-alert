"""Validation Exception Classes"""

from .base_exceptions import AfvalAlertError


class ValidationError(AfvalAlertError):
    """Validation fout"""

    pass
