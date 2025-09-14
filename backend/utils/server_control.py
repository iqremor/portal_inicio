import threading
import time
import requests
import logging
from werkzeug.serving import make_server
from app import create_app
from middleware.shutdown import ShutdownMiddleware

log = logging.getLogger(__name__)

class ServerManager:
    _instance = None
    _server_thread = None
    _server_stop_event = threading.Event()
    _app_instance = None
    _host = '0.0.0.0'
    _port = 5000
    _debug = False

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(ServerManager, cls).__new__(cls, *args, **kwargs)
        return cls._instance

    def _run_server(self):
        # Create a new app instance for each thread to avoid state conflicts
        self._app_instance = create_app()
        try:
            log.info("[ServerManager] Server thread starting.")
            wrapped_app = ShutdownMiddleware(self._app_instance, self._server_stop_event, debug=self._debug) # Assuming debug for now
            srv = make_server(host=self._host, port=self._port, app=wrapped_app)
            
            with self._app_instance.app_context():
                @self._app_instance.route('/_shutdown', methods=['POST'])
                def shutdown():
                    if not self._server_stop_event.is_set():
                        return 'Server not stopping', 403
                    srv.shutdown()
                    return 'Server shutting down...'
            
            log.info(f"[ServerManager] Starting server on {self._host}:{self._port}")
            srv.serve_forever()
        except Exception as e:
            log.error(f"[ServerManager] Error during server run: {e}")
        finally:
            log.info("[ServerManager] Server thread exiting.")

    def start_server(self, host='0.0.0.0', port=5000, debug=False):
        if self.is_running():
            log.warning("Server is already running.")
            return False
        
        self._host = host
        self._port = port
        self._debug = debug
        self._server_stop_event.clear()
        self._server_thread = threading.Thread(target=self._run_server, daemon=True)
        self._server_thread.start()
        log.info("Server started.")
        time.sleep(1.5) # Give server a moment to start
        return True

    def stop_server(self):
        if not self.is_running():
            log.warning("Server is not running.")
            return False
        
        log.info("Stopping server...")
        self._server_stop_event.set()
        try:
            requests.post(f'http://{self._host}:{self._port}/_shutdown', timeout=2)
        except requests.exceptions.ConnectionError:
            if self._debug:
                log.warning("Connection refused during shutdown request (server likely already stopped).")
        except Exception as e:
            log.error(f"Error sending shutdown request: {e}")
        
        if self._server_thread and self._server_thread.is_alive():
            self._server_thread.join(timeout=5)
        self._server_stop_event.clear()
        log.info("Server stopped.")
        return True

    def restart_server(self, host='0.0.0.0', port=5000):
        log.info("Restarting server...")
        self.stop_server()
        return self.start_server(host, port)

    def is_running(self):
        return self._server_thread and self._server_thread.is_alive()

# Create a singleton instance
server_manager = ServerManager()