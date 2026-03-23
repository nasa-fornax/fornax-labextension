import os
from jupyter_server._tz import utcnow
from tornado.ioloop import PeriodicCallback
import psutil
from functools import partial


async def update_last_activity(settings, logger, percent_min=70):
    """Checks for CPU usage and update the last activity if there is activity

    Parameters
    ----------
    settings: dict
        ServerApp setting dict
    logger: logging object
    percent_min: int
        Minimum CPU activity to consider as running.
    """
    # consider individual cpu's separately
    isactive = sum(psutil.cpu_percent(percpu=True)) > percent_min
    text = f"fornax_labextension activity: {isactive}"
    sep = '\n    '
    if isactive:
        now = utcnow()
        settings['last_activity_times']['cpu-activity'] = f'{now}'
        # prevent terminals from culling if we have activity
        terms = settings.get("terminal_manager")
        for term in terms.terminals.values():
            term.last_activity = now
            settings['terminal_last_activity'] = f'{now}'
        text += f'{sep}activity updated to (inc terminals): {now}'
    logger.info(text)


def setup_activity_tracker(app):
    default_percent_min = 70
    try:
        percent_min = os.environ.get('JUPYTER_CPU_ALIVE_PERCENT_MIN', 70)
        percent_min = float(percent_min)
    except ValueError:
        app.log.warn(('fornax_labextension: JUPYTER_CPU_ALIVE_PERCENT_MIN '
                      'cannot be converted to a float; using '
                     f'{default_percent_min}'))
        percent_min = default_percent_min

    # interval in seconds; default is 5 min
    default_interval = 5*60
    try:
        interval = os.environ.get(
            'JUPYTER_CPU_ALIVE_INTERVAL',
            default_interval
        )
        interval = float(interval)
    except ValueError:
        app.log.warn(('fornax_labextension: JUPYTER_CPU_ALIVE_INTERVAL '
                      'cannot be converted to a float; using '
                     f'{default_interval}'))
        interval = default_interval

    func = partial(
        update_last_activity,
        settings=app.web_app.settings,
        logger=app.log,
        percent_min=percent_min,
    )
    # note that this needs the interval in milliseconds
    pc = PeriodicCallback(func, interval*1e3)
    app.log.info(('fornax_labextension starting activity tracker with '
                 f'percent_min: {percent_min}, interval: {interval}'))
    pc.start()
