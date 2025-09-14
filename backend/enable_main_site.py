# enable_main_site.py
from app import create_app
from models import db, ConfiguracionSistema

def enable_site():
    """
    Busca la configuración 'MAIN_SITE_ENABLED' en la base de datos
    y establece su valor en '1'. Si no existe, la crea.
    """
    app = create_app()
    with app.app_context():
        config = ConfiguracionSistema.query.filter_by(clave='MAIN_SITE_ENABLED').first()
        
        if config:
            print("La configuración 'MAIN_SITE_ENABLED' ya existe. Actualizando valor a '1'.")
            config.valor = '1'
        else:
            print("La configuración 'MAIN_SITE_ENABLED' no existe. Creándola con valor '1'.")
            config = ConfiguracionSistema(clave='MAIN_SITE_ENABLED', valor='1', descripcion='Habilita o deshabilita el sitio principal.')
            db.session.add(config)
            
        db.session.commit()
        print("¡Sitio principal habilitado en la base de datos!")

if __name__ == '__main__':
    enable_site()
