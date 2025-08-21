"""Singleton Pattern Decorator"""


def singleton(cls: type) -> type:
    """Singleton pattern - één instantie per class"""
    instances = {}

    def get_instance(*args, **kwargs):
        if cls not in instances:
            instances[cls] = cls(*args, **kwargs)
        return instances[cls]

    return get_instance
