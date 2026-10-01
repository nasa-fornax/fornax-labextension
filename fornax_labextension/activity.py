import os
from jupyter_server._tz import utcnow
from tornado.ioloop import PeriodicCallback
import psutil
import asyncio
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
        settings['last_activity_times']['cpu-activity'] = now
        # prevent terminals from culling if we have activity
        terms = settings.get("terminal_manager")
        for term in terms.terminals.values():
            term.last_activity = now
            settings['terminal_last_activity'] = now
        text += f'{sep}activity updated to: {now}'
        # log all settings that have 'activity' in the key
    text += f'{sep}====== Activity Summary: ======='
    for key in settings.keys():
        if key == 'last_activity_times':
            for sub_key in settings[key]:
                name = f'{key}:{sub_key}'
                text += f'{sep}{name:40}: {settings[key][sub_key]}'
        elif 'activity' in key:
            text += f'{sep}{key:40}: {settings[key]}'

    # --- Get Top 3 CPU Consuming Processes ---
    if isactive:
        text += f'{sep}====== Top CPU Consuming Commands: ======='
        
        # Initialize the CPU percent counter for all processes
        for proc in psutil.process_iter():
            try:
                proc.cpu_percent(interval=None)
            except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                pass

        # Yield control back to the event loop for 100ms to measure CPU time
        await asyncio.sleep(0.1)

        # Read the measured CPU usage for each process
        procs = []
        for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
            try:
                cpu_usage = proc.cpu_percent(interval=None)
                cmd = proc.info['cmdline']
                cmd_str = " ".join(cmd) if cmd else proc.info['name']
                
                procs.append({
                    'pid': proc.info['pid'],
                    'command': cmd_str,
                    'cpu_percent': cpu_usage
                })
            except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                pass

        # Sort by highest CPU usage, grab the top 3, and append them to the log text
        top_cpu = sorted(procs, key=lambda p: p['cpu_percent'], reverse=True)[:3]
        for i, p_info in enumerate(top_cpu, 1):
            # Truncate command to 80 characters so it doesn't flood the logs
            short_cmd = (
                p_info['command'][:80] + '...'
                if len(p_info['command']) > 80 else p_info['command']
            )
            text += (f"{sep}{i}. CPU: {p_info['cpu_percent']:>5.1f}% | "
                     f"PID: {p_info['pid']:<6} | Cmd: {short_cmd}")

    # Log the final assembled text
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
