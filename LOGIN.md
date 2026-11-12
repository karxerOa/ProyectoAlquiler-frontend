# Frontend de alquiler de vestimentas

## Arquitectura y mejoras

Se mantiene la estructura de carpetas, los decoradores existentes y los alias. El login vive en `pages/login`, separado del layout protegido. Las páginas se cargan bajo demanda. El servicio de sesión, las guardas y el interceptor gestionan el JWT; solo la API propia recibe el encabezado Bearer. Los permisos definitivos se validan en el backend.

Se tomó como referencia visual https://roman-big-22455837.figma.site/: navegación lateral, cabecera, colores, dashboard y asistente de alquiler. Formularios, botones, tarjetas, selectores, confirmaciones y diálogos usan Angular Material. Las listas conservan tablas HTML semánticas.

El dashboard y los reportes consultan datos reales. El nuevo alquiler tiene cuatro pasos: cliente, prendas, fechas/responsable y confirmación. Se validan fechas e importes; ante un fallo parcial se conserva el alquiler creado y se consultan sus detalles antes de reintentar. Se añadieron devoluciones pendientes y exportación CSV de reportes. DNI y teléfono se envían como texto para conservar ceros iniciales.

## Rama y ejecución

La rama de trabajo ya existe y es `feature/login`. La rama reúne el login, el rediseño y las correcciones del flujo de alquiler.

```powershell
cd C:\Users\USUARIO\ProyectoAlquiler-Frontend
git switch feature/login
npm install
npm start
```

Para crear esa rama en otra copia donde todavía no exista, parte de la versión deseada y ejecuta `git checkout -b feature/login`.

Inicia el backend en http://localhost:9494 y abre http://localhost:4200/login. Usa una cuenta de la aplicación; las credenciales de PostgreSQL no sirven para el login.

```powershell
npm run build
npm test -- --watch=false
```

## Recorrido de prueba

1. Abre `/alquileres` sin sesión: debe redirigir al login.
2. Inicia sesión y comprueba el dashboard con los registros de la base de datos.
3. Abre Nuevo alquiler. Selecciona cliente y prendas, asigna empleado y fechas. Comprueba el total antes de confirmar.
4. Después de confirmar, revisa la ficha del alquiler y sus detalles. Si falla una parte, conserva la página y utiliza Completar registro.
5. Abre Clientes y comprueba búsqueda y formulario. Cancelar cierra el diálogo sin guardar.
6. Consulta Devoluciones y Reportes. La exportación se habilita cuando terminan de cargar los datos.
7. Cierra sesión y comprueba que las páginas protegidas ya no están accesibles.

## Límites del contrato actual

- La API no aporta fotografías, garantías ni tarifas diarias: se muestran prendas sin fotografía e importes por alquiler. No se inventan datos del prototipo.
- Cabecera y detalles se guardan en solicitudes separadas. La recuperación reduce duplicados, pero una garantía transaccional e idempotencia completas requieren un endpoint agregado en el backend. Ante un resultado incierto de creación se bloquea el reenvío y se pide revisar la lista.
- La disponibilidad se basa en el estado de la prenda. La reserva de stock concurrente y disponibilidad por intervalo de fechas requieren validación transaccional en el backend.
- JWT se conserva en sessionStorage. HttpOnly y Keycloak requieren integración específica del servidor; no forman parte de este contrato JWT.
- El diseño adapta la referencia publicada; no es una reproducción exacta de todos los datos y funciones simuladas de Figma.
