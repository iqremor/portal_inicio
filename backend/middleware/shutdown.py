# middleware/shutdown.py
import click

class ShutdownMiddleware:
    def __init__(self, app, stop_event, debug=False):
        self.app = app
        self.stop_event = stop_event
        self.debug = debug
    
    def __call__(self, environ, start_response):
        if self.stop_event.is_set():
            if self.debug:
                click.echo(click.style("[DEBUG] ShutdownMiddleware detected stop event.", fg='magenta'))
            # This will cause run_simple to shut down
            raise SystemExit("Server requested to stop.")
        return self.app(environ, start_response)