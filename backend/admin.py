# admin.py

# --Librerías Necesarias --
from flask_admin import Admin, AdminIndexView, expose, BaseView # Para la interfaz de administración
from flask_admin.contrib.sqla import ModelView # Para integrar SQLAlchemy con Flask-Admin
from flask_admin.contrib.fileadmin import FileAdmin
from flask_admin.form import Select2Widget # Para mejorar los campos de selección en formularios
from flask_admin.model import typefmt # Para formatear tipos de datos en las vistas
from werkzeug.security import generate_password_hash # Para hashear contraseñas
from wtforms import PasswordField, TextAreaField, SelectField # Para campos de formulario personalizados
from wtforms.validators import DataRequired, Email # Para validación de formularios
from datetime import datetime, timedelta # Para manejar fechas y horas
import os # Para manejo de rutas y archivos
import os.path as op
from flask import redirect, url_for, request, session, flash, render_template # Added session, flash, render_template
from sqlalchemy.exc import OperationalError # Added for database error handling

from models import db, User, Peticion, Comentario, ConfiguracionSistema, Log, UserRole, PeticionEstado

# Se crea la instancia de Admin sin asociarla a la app todavía
admin = Admin(name='Mi Panel de Admin', template_mode='bootstrap4')


# Vista personalizada para el panel principal
class MyAdminIndexView(AdminIndexView):
    def is_accessible(self):
        if self.admin.app.debug:
            print(f"is_accessible called. session['logged_in']: {session.get('logged_in')}")
        return session.get('logged_in')

    def inaccessible_callback(self, name, **kwargs):
        if self.admin.app.debug:
            print(f"inaccessible_callback called. request.endpoint: {request.endpoint}, request.url: {request.url}, request.path: {request.path}")
            
            login_path = url_for('admin.login_view')
            print(f"login_path from url_for: {login_path}")

            if request.endpoint == 'admin.login_view':
                print("Match: request.endpoint == 'admin.login_view'. Allowing login view to proceed.")
            
            print("No match: request.path != login_path. Redirecting to login with next parameter.")
        if request.endpoint == 'admin.login_view':
            return None # This line must be outside the debug block
        return redirect(url_for('admin.login_view', next=request.url))

    @expose('/')
    def index(self):
        # Obtener el estado del sitio de prueba
        test_site_enabled = ConfiguracionSistema.query.filter_by(clave='TEST_SITE_ENABLED').first()
        if not test_site_enabled:
            test_site_enabled = ConfiguracionSistema(clave='TEST_SITE_ENABLED', valor='0', descripcion='Activa o desactiva el sitio de prueba.')
            db.session.add(test_site_enabled)
            db.session.commit()

        # Estadísticas básicas
        stats = {
            'total_usuarios': User.query.count(),
            'total_peticiones': Peticion.query.count(),
            'peticiones_pendientes': Peticion.query.filter_by(estado=PeticionEstado.PENDIENTE).count(),
            'peticiones_completadas': Peticion.query.filter_by(estado=PeticionEstado.COMPLETADA).count(),
        }
        
        # Peticiones recientes
        peticiones_recientes = Peticion.query.order_by(Peticion.created_at.desc()).limit(5).all()
        
        # Usuarios recientes
        usuarios_recientes = User.query.order_by(User.created_at.desc()).limit(5).all()
        
        return self.render('admin/index.html', 
                         stats=stats,
                         peticiones_recientes=peticiones_recientes,
                         usuarios_recientes=usuarios_recientes,
                         test_site_enabled=test_site_enabled.valor == '1')

    @expose('/toggle-test-site')
    def toggle_test_site(self):
        config = ConfiguracionSistema.query.filter_by(clave='TEST_SITE_ENABLED').first()
        if config:
            config.valor = '1' if config.valor == '0' else '0'
            db.session.commit()
        return redirect(url_for('.index'))

    @expose('/login/', methods=('GET', 'POST'))
    def login_view(self):
        # handle user login
        if request.method == 'POST':
            username = request.form['username']
            password = request.form['password']

            user = db.session.query(User).filter_by(username=username, role=UserRole.ADMIN).first()

            if user and user.check_password(password):
                session['logged_in'] = True
                session['admin_user_id'] = user.id # Store admin user ID in session
                session['user_role'] = user.role.value # <-- AÑADIR ESTA LÍNEA
                if self.admin.app.debug:
                    print(f"DEBUG: After setting session['logged_in'] in POST: {session.get('logged_in')}") # Debug print
                    print(f"DEBUG: Full session object after login: {dict(session)}") # Print full session
                flash('¡Inicio de sesión exitoso!', 'success')
                return redirect(request.args.get('next') or url_for('admin.index'))
            else:
                flash('Nombre de usuario o contraseña incorrectos.', 'danger')

        if self.admin.app.debug:
            print(f"DEBUG: session['logged_in'] on GET/initial load: {session.get('logged_in')}") # Debug print
            print(f"DEBUG: Full session object on GET/initial load: {dict(session)}") # Print full session
        return self.render('admin/login.html')

    @expose('/logout/')
    def logout_view(self):
        session.pop('logged_in', None)
        flash('Has cerrado sesión.', 'info')
        return redirect(url_for('admin.login_view'))

# Vista personalizada para usuarios
class UserModelView(ModelView):
    # Configuración de columnas
    column_list = ['username', 'role', 'is_active', 'created_at', 'peticiones']
    column_details_list = ['id', 'username', 'role', 'is_active', 'created_at', 'updated_at']
    column_searchable_list = ['username']
    column_filters = ['role', 'is_active', 'created_at']
    column_editable_list = ['is_active', 'role']
    edit_template = 'admin/user/edit.html'
    
    def is_accessible(self):
        """Verifica si el usuario tiene acceso al panel de administración"""
        from flask import session
        return session.get('logged_in') and session.get('user_role') == 'admin'
    
    def inaccessible_callback(self, name, **kwargs):
        """Redirige a la página de login cuando no hay acceso"""
        from flask import redirect, url_for
        return redirect(url_for('web_main.login', next=request.url))
    
    # Configuración de formularios
    form_excluded_columns = ['password_hash', 'peticiones', 'comentarios', 'logs', 'updated_at']
    
    # Etiquetas personalizadas
    column_labels = {
        'username': 'Nombre de Usuario',
        'role': 'Rol',
        'is_active': 'Activo',
        'created_at': 'Fecha de Creación',
        'updated_at': 'Última Actualización',
        'peticiones': 'Peticiones'
    }
    
    # Formateo de columnas
    column_type_formatters = {
        datetime: lambda view, value: value.strftime('%d/%m/%Y %H:%M') if value else ''
    }
    
    # Configuración de paginación
    page_size = 25
    
    # Campo personalizado para contraseña
    form_extra_fields = {
        'password': PasswordField('Nueva Contraseña'),
    }
    
    def create_model(self, form):
        """Personaliza la creación de usuarios"""
        try:
            model = self.model()
            form.populate_obj(model)
            
            # Hashear la contraseña si se proporciona
            if form.password.data:
                model.set_password(form.password.data)
            
            self.session.add(model)
            self._on_model_change(form, model, True)
            self.session.commit()
        except Exception as ex:
            if not self.handle_view_exception(ex):
                raise
            self.session.rollback()
            return False
        else:
            self.after_model_change(form, model, True)
        return model
    
    def update_model(self, form, model):
        """Personaliza la actualización de usuarios"""
        try:
            form.populate_obj(model)
            
            # Actualizar contraseña solo si se proporciona una nueva
            if form.password.data:
                model.set_password(form.password.data)
            
            model.updated_at = datetime.utcnow()
            self._on_model_change(form, model, False)
            self.session.commit()
        except Exception as ex:
            if not self.handle_view_exception(ex):
                raise
            self.session.rollback()
            return False
        else:
            self.after_model_change(form, model, False)
        return True

    def edit_form(self, obj=None):
        form = super(UserModelView, self).edit_form(obj)
        from models import Cuadernillo, UserCuadernilloActivation

        # Obtener todos los cuadernillos
        todos_los_cuadernillos = Cuadernillo.query.all()

        # Obtener las activaciones para el usuario actual
        activaciones = UserCuadernilloActivation.query.filter_by(user_id=obj.id).all()
        activaciones_dict = {act.cuadernillo_id: act.is_active for act in activaciones}

        # Añadir información al formulario para que esté disponible en la plantilla
        form.cuadernillos = todos_los_cuadernillos
        form.activaciones = activaciones_dict

        return form

# Vista personalizada para peticiones
class PeticionModelView(ModelView):
    # Configuración de columnas
    column_list = ['titulo', 'usuario', 'estado', 'prioridad', 'created_at', 'fecha_limite']
    column_details_list = ['id', 'titulo', 'descripcion', 'usuario', 'estado', 'prioridad', 
                          'created_at', 'updated_at', 'fecha_limite']
    column_searchable_list = ['titulo', 'descripcion']
    column_filters = ['estado', 'prioridad', 'created_at', 'user_id']
    column_editable_list = ['estado', 'prioridad']
    
    def is_accessible(self):
        """Verifica si el usuario tiene acceso al panel de administración"""
        from flask import session
        return session.get('logged_in') and session.get('user_role') == 'admin'
    
    def inaccessible_callback(self, name, **kwargs):
        """Redirige a la página de login cuando no hay acceso"""
        from flask import redirect, url_for
        return redirect(url_for('web_main.login', next=request.url))
    
    # Etiquetas personalizadas
    column_labels = {
        'titulo': 'Título',
        'descripcion': 'Descripción',
        'usuario': 'Usuario',
        'estado': 'Estado',
        'prioridad': 'Prioridad',
        'created_at': 'Fecha de Creación',
        'updated_at': 'Última Actualización',
        'fecha_limite': 'Fecha Límite',
        'user_id': 'ID Usuario'
    }
    
    # Formateo de columnas
    column_type_formatters = {
        datetime: lambda view, value: value.strftime('%d/%m/%Y %H:%M') if value else ''
    }
    
    # Configuración de formularios
    form_overrides = {
        'descripcion': TextAreaField
    }
    
    # Configuración de paginación
    page_size = 25
    
    def get_query(self):
        """Personaliza la query base"""
        return self.session.query(self.model).join(User)
    
    def get_count_query(self):
        """Personaliza la query de conteo"""
        return self.session.query(self.model).join(User)

# Vista personalizada para comentarios
class ComentarioModelView(ModelView):
    column_list = ['peticion', 'usuario', 'contenido', 'created_at']
    column_details_list = ['id', 'contenido', 'peticion', 'usuario', 'created_at']
    column_searchable_list = ['contenido']
    column_filters = ['created_at', 'user_id', 'peticion_id']
    
    column_labels = {
        'contenido': 'Contenido',
        'peticion': 'Petición',
        'usuario': 'Usuario',
        'created_at': 'Fecha de Creación'
    }
    
    def is_accessible(self):
        """Verifica si el usuario tiene acceso al panel de administración"""
        from flask import session
        return session.get('logged_in') and session.get('user_role') == 'admin'
    
    def inaccessible_callback(self, name, **kwargs):
        """Redirige a la página de login cuando no hay acceso"""
        from flask import redirect, url_for
        return redirect(url_for('web_main.login', next=request.url))
    
    form_overrides = {
        'contenido': TextAreaField
    }
    
    column_type_formatters = {
        datetime: lambda view, value: value.strftime('%d/%m/%Y %H:%M') if value else ''
    }
    
    page_size = 25

# Vista para configuración del sistema
class ConfiguracionSistemaView(ModelView):
    """Vista personalizada para el modelo ConfiguracionSistema."""
    column_list = ('clave', 'valor', 'descripcion', 'updated_at')
    form_columns = ('clave', 'valor', 'descripcion')
    column_labels = {
        'clave': 'Clave',
        'valor': 'Valor',
        'descripcion': 'Descripción',
        'updated_at': 'Última Modificación'
    }
    
    def is_accessible(self):
        """Verifica si el usuario tiene acceso al panel de administración"""
        from flask import session
        return session.get('logged_in') and session.get('user_role') == 'admin'
    
    def inaccessible_callback(self, name, **kwargs):
        """Redirige a la página de login cuando no hay acceso"""
        from flask import redirect, url_for
        return redirect(url_for('web_main.login', next=request.url))

# Vista para Sesiones Activas
class ActiveSessionView(ModelView):
    list_template = 'admin/active_session_list.html'
    # Deshabilitar la creación y edición manual desde el panel
    can_create = False
    can_edit = False
    can_delete = True # Permitir eliminar para forzar el logout

    # Columnas a mostrar en la lista
    column_list = ('user.nombre_completo', 'login_time', 'last_seen', 'ip_address', 'user_agent', 'cuadernillo.nombre') # Added cuadernillo.nombre
    
    # Etiquetas más amigables para las columnas
    column_labels = {
        'user.nombre_completo': 'Usuario',
        'login_time': 'Hora de Inicio',
        'last_seen': 'Última Actividad',
        'ip_address': 'Dirección IP',
        'user_agent': 'Navegador/Dispositivo',
        'cuadernillo.nombre': 'Examen Actual' # Added label
    }
    
    # Ordenar por defecto por la última actividad
    column_default_sort = ('last_seen', True)

    # Formateo de fechas
    column_type_formatters = {
        datetime: lambda view, value, name: (value - timedelta(hours=5)).strftime('%d/%m/%Y %H:%M:%S') if value else ''
    }

    def is_accessible(self):
        """Verifica si el usuario tiene acceso."""
        return session.get('logged_in') and session.get('user_role') == 'admin'
    
    def inaccessible_callback(self, name, **kwargs):
        """Redirige a la página de login cuando no hay acceso."""
        return redirect(url_for('web_main.login', next=request.url))

def init_admin(app):
    """Inicializa Flask-Admin."""
    from models import db, User, Peticion, Comentario, ConfiguracionSistema, Log, ActiveSession
    
    admin = Admin(
        app, 
        name='Panel de Administración', 
        template_mode='bootstrap4',
        index_view=MyAdminIndexView(url='/admin')
    )
    
    # Registrar las vistas de modelos
    admin.add_view(UserModelView(User, db.session, name='Usuarios'))
    admin.add_view(PeticionModelView(Peticion, db.session, name='Peticiones'))
    admin.add_view(ComentarioModelView(Comentario, db.session, name='Comentarios'))
    admin.add_view(ConfiguracionSistemaView(ConfiguracionSistema, db.session, name='Configuración'))
    admin.add_view(ModelView(Log, db.session, name='Logs del Sistema'))
    admin.add_view(ActiveSessionView(ActiveSession, db.session, name='Sesiones Activas'))
    admin.add_view(DatabaseAdminView(name='Gestión DB', endpoint='db_admin'))
    admin.add_view(ExamAvailabilityView(name='Gestión de Exámenes', endpoint='exam_availability'))
    
    # Añadir vista de gestión de archivos para la raíz del proyecto
    path = op.abspath(op.join(op.dirname(__file__), '..'))
    admin.add_view(FileAdmin(path, '/files/', name='Gestor de Archivos'))
    
    return admin

# Agregar en la función init_admin o donde configures las vistas
from flask import request, jsonify

class AdminDashboardView(BaseView):
    @expose('/')
    def index(self):
        # Agregar lógica para mostrar estado
        return self.render('admin/index.html')

# La plantilla del dashboard ahora se carga desde templates/admin/index.html
# y ya no es necesario generarla desde aquí. El código anterior ha sido eliminado.

class DatabaseAdminView(BaseView):
    @expose('/', methods=('GET', 'POST'))
    def index(self):
        if request.method == 'POST':
            # Manejar carga de archivos
            if 'database' in request.files:
                file = request.files['database']
                if file.filename != '':
                    if file.filename.endswith('.db'):
                        from flask import current_app
                        import os
                        file_path = os.path.join(current_app.instance_path, 'sistema_gestion.db')
                        file.save(file_path)
                        flash('Base de datos cargada y reemplazada exitosamente.', 'success')
                    else:
                        flash('Error: El archivo debe tener la extensión .db', 'danger')
                else:
                    flash('No se seleccionó ningún archivo para cargar.', 'warning')
                return redirect(url_for('.index'))

            action = request.form.get('action')
            try:
                if action == 'apply_prefix':
                    prefix = request.form.get('path_prefix')
                    if not prefix:
                        flash('No se proporcionó ningún prefijo.', 'warning')
                    else:
                        from models import Cuadernillo, db
                        cuadernillos = Cuadernillo.query.all()
                        actualizados = 0
                        for c in cuadernillos:
                            if not c.dir_banco.startswith(prefix):
                                c.dir_banco = f"{prefix}{c.dir_banco}"
                                actualizados += 1
                        
                        if actualizados > 0:
                            db.session.commit()
                            flash(f'Se ha aplicado el prefijo "{prefix}" a {actualizados} cuadernillo(s).', 'success')
                        else:
                            flash(f'No se necesitó actualizar ningún cuadernillo con el prefijo "{prefix}".', 'info')
                
                elif action == 'seed_db':
                    from models import seed_data
                    seed_data()
                    flash('La base de datos ha sido poblada con datos iniciales (seeding).', 'success')

                elif action == 'create_tables':
                    from models import create_tables
                    create_tables()
                    flash('Todas las tablas han sido creadas en la base de datos.', 'success')

                elif action == 'drop_tables':
                    from models import drop_tables
                    drop_tables()
                    flash('¡ADVERTENCIA! Todas las tablas han sido eliminadas de la base de datos.', 'danger')
                
                else:
                    flash('Acción desconocida.', 'danger')

            except Exception as e:
                flash(f'Ocurrió un error: {str(e)}', 'danger')

            return redirect(url_for('.index'))

        return self.render('admin/db_admin.html')

    def is_accessible(self):
        return session.get('logged_in') and session.get('user_role') == 'admin'

    def inaccessible_callback(self, name, **kwargs):
        return redirect(url_for('admin.login_view', next=request.url))

    @expose('/download-db/')
    def download_db(self):
        from flask import current_app, send_from_directory
        db_path = current_app.instance_path
        return send_from_directory(db_path, 'sistema_gestion.db', as_attachment=True)

class ExamAvailabilityView(BaseView):
    @expose('/', methods=('GET', 'POST'))
    def index(self):
        from models import Cuadernillo, ExamAvailability, db

        if request.method == 'POST':
            from models import Cuadernillo, ExamAvailability, db # Re-import for clarity

            # Get all cuadernillos to iterate through all possible combinations
            # This is important because unchecked checkboxes are not sent in request.form
            all_cuadernillos = Cuadernillo.query.all()
            
            # Iterate through all cuadernillos and their associated grades
            # (assuming each cuadernillo has a single 'grado' it applies to)
            for c in all_cuadernillos:
                cuadernillo_id = c.id
                grado = c.grado # Get the grade associated with this cuadernillo

                # Check if the checkbox for this cuadernillo-grado combination was checked
                # If the checkbox is present in request.form, it means it was checked ('on')
                # If it's not present, it means it was unchecked.
                is_enabled = f'cuadernillo-{cuadernillo_id}-{grado}' in request.form

                availability = ExamAvailability.query.filter_by(
                    cuadernillo_id=cuadernillo_id,
                    grado=grado
                ).first()

                if availability:
                    # Only update if the status has changed to avoid unnecessary DB writes
                    if availability.is_enabled != is_enabled:
                        availability.is_enabled = is_enabled
                        db.session.add(availability) # Add to session for update
                else:
                    # If no record exists, create one only if it's enabled
                    # If it's disabled and no record exists, we don't need to create a 'False' record
                    if is_enabled:
                        availability = ExamAvailability(
                            cuadernillo_id=cuadernillo_id,
                            grado=grado,
                            is_enabled=is_enabled
                        )
                        db.session.add(availability)
            
            try:
                db.session.commit()
                flash('La disponibilidad de los exámenes ha sido actualizada.', 'success')
            except Exception as e:
                db.session.rollback()
                flash(f'Error al actualizar la disponibilidad: {str(e)}', 'danger')
            
            active_filter = request.form.get('active_grade_filter', 'all')
            return redirect(url_for('.index', filter_grade=active_filter))

        # Lógica para mostrar la tabla
        try:
            # Try to query the table to check if it exists
            availability_data = ExamAvailability.query.all()
        except OperationalError:
            # If table does not exist, flash a message and return an empty view
            flash('La tabla "exam_availability" no existe. Por favor, ve a "Gestión DB" y haz clic en "Crear Tablas" para inicializarla.', 'warning')
            # Return an empty list for cuadernillos and grados to prevent further errors
            return self.render('admin/exam_availability.html', 
                             cuadernillos=[], 
                             grados=[],
                             availability_map={})

        cuadernillos = Cuadernillo.query.order_by(Cuadernillo.grado, Cuadernillo.area).all()
        grados = sorted(list(set([int(c.grado) for c in cuadernillos])))
        
        availability_map = {}
        for avail in availability_data:
            availability_map[(avail.cuadernillo_id, avail.grado)] = avail.is_enabled

        return self.render('admin/exam_availability.html', 
                         cuadernillos=cuadernillos, 
                         grados=grados,
                         availability_map=availability_map)

    def is_accessible(self):
        return session.get('logged_in') and session.get('user_role') == 'admin'

    def inaccessible_callback(self, name, **kwargs):
        return redirect(url_for('admin.login_view', next=request.url))


    @expose('/download-db/')
    def download_db(self):
        from flask import current_app, send_from_directory
        db_path = current_app.instance_path