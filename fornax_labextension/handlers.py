"""Server handlers for the Fornax Lab Extension."""

import json
import subprocess
import os

from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join
import tornado
from tornado.web import HTTPError


def update_notebooks():
    """Script to update the notebooks by calling the update-notebooks.sh script.
    
    Return
    (success, message)
    """
    update_script = '/usr/local/bin/update-notebooks.sh'
    cmd = [update_script]

    # Check if script exists and is executable
    if not os.path.exists(update_script):
        message = f'{update_script} does not exist. Please contact support.'
        return False, message

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=120,  # 2 minute timeout
        )

        if result.returncode == 0:
            return True, result.stdout
        else:
            return False, result.stderr

    except subprocess.TimeoutExpired:
        return False, "Update script operation timed out"
    except Exception as e:
        return False, str(e)


class UpdateNotebooksHandler(APIHandler):
    """Handler for updating notebooks using the system script."""

    @tornado.web.authenticated
    def post(self):
        """Execute update-notebooks.sh script to update notebooks."""
        # a catch block for handling errors
        try:
            self.log.info(f"fornax-labextension: Updating notebooks ...")
            status, message = update_notebooks()
            if status:
                response = {
                    'success': True,
                    'message': 'Notebooks updated successfully',
                }
                self.log.info(f"fornax-labextension: {response['message']}.")
            else:
                response = {
                    'success': False,
                    'message': 'Notebooks update failed',
                }
                self.log.error(f"fornax-labextension: {response['message']}\n {message}")

            self.finish(json.dumps(response))
            
        except Exception as e:
            self.log.error(f"Error in update notebooks handler: {str(e)}")
            raise HTTPError(500, f"Internal server error: {str(e)}")


def setup_handlers(web_app):
    """Setup the API handlers."""
    host_pattern = ".*$"
    
    base_url = web_app.settings["base_url"]
    handlers = [
        (url_path_join(base_url, "fornax-labextension", "update-notebooks"), UpdateNotebooksHandler)
    ]
    web_app.add_handlers(host_pattern, handlers)
