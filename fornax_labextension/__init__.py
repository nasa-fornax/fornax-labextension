try:
    from ._version import __version__
except ImportError:
    # Fallback when using the package in dev mode without installing
    # in editable mode with pip. It is highly recommended to install
    # the package from a stable release or in editable mode:
    # https://pip.pypa.io/en/stable/topics/local-project-installs/#editable-installs
    import warnings
    warnings.warn(
        "Importing 'fornax_labextension' outside a proper installation."
    )
    __version__ = "dev"


def _jupyter_labextension_paths():
    return [{
        "src": "labextension",
        "dest": "fornax-labextension"
    }]


def _jupyter_server_extension_points():
    """
    Returns a list of dictionaries with metadata describing
    where to find the `_load_jupyter_server_extension` function.
    """
    return [{
        "module": "fornax_labextension",
    }]


def _load_jupyter_server_extension(server_app):
    """Load the Jupyter Server extension."""
    from .handlers import setup_handlers
    
    setup_handlers(server_app.web_app)
    name = "fornax_labextension"
    server_app.log.info(f"Registered {name} server extension")
