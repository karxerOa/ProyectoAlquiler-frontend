# Ajustes del flujo de alquiler de vestimentas

## Cambios de uso

- Se retiran los identificadores internos del texto visible, tablas, mensajes de validación y confirmaciones. Se conservan exclusivamente para relacionar registros y comunicarse con la API.
- Las prendas se buscan y seleccionan por nombre; se incluyen talla y color para distinguir prendas con nombres iguales. Las prendas inactivas quedan fuera del catálogo y de las opciones para nuevas operaciones. Los nombres históricos se conservan para entender alquileres anteriores.
- Nuevo alquiler pide el DNI completo del cliente y muestra su nombre. La comparación es exacta y conserva los ceros iniciales que el contrato actual representa como número. Si el cliente no está registrado, se indica que debe crearse primero.
- Cada cliente tiene un botón «Ver alquileres», con historial, fechas, estado, total registrado y acceso a la ficha del alquiler. El historial se relaciona por cliente, no por coincidencia de nombres.
- «Prendas del alquiler» se integra en la ficha del alquiler. Después de guardar una reserva se abre esa ficha para añadir prendas disponibles. No se permite registrar la entrega sin prendas vinculadas.
- La recepción se registra dentro del alquiler entregado. La ficha muestra la devolución, quién la recibió y las prendas que pertenecían a ese alquiler.
- Al recibir, se revisa cada prenda: recibida sin mantenimiento, recibida con mantenimiento o pendiente de recepción. La revisión se conserva como texto en la observación admitida por la API. Se valida que las prendas faltantes coincidan con el estado de recepción incompleta.
- Las recepciones completas se presentan como alquileres devueltos y dejan de aparecer en la agenda pendiente. Una recepción incompleta no certifica que todas las prendas se devolvieron.
- Los alquileres con recepciones no se editan ni eliminan desde este flujo, para conservar el historial.
- Mantenimiento parte de una recepción completa y ofrece las prendas de ese alquiler. Se conserva el contexto de la recepción en la descripción existente del mantenimiento. Los registros antiguos se siguen mostrando sin inventarles un origen.
- Roles y usuarios se agrupan en «Administración» y salen del menú operativo principal. No se eliminan sus entidades ni se cambia la autorización del servidor.
- Las antiguas rutas independientes de detalles y devoluciones llevan a Alquileres.

## Atributos retirados del frontend

| Modelo TypeScript | Atributos retirados | Motivo |
|---|---|---|
| `Cliente` | `alquileres` | El historial se consulta y filtra por la relación del alquiler, sin duplicar la colección en cada cliente. |
| `Categoria` | `prendas` | La colección anidada no se utilizaba; el catálogo ya relaciona cada prenda con su categoría. |
| `Empleado` | `producciones`, `mantenimientos`, `alquileres`, `devoluciones` | Colecciones expandidas sin uso en las pantallas; las relaciones ya pertenecen a sus registros. |
| `Usuario` | `password` en el modelo de lectura | La contraseña solo pertenece a los datos de creación/cambio; no debe formar parte del modelo que utiliza la lista de usuarios. |

También se retiran del formulario independiente los campos para introducir manualmente la relación alquiler–prenda: el alquiler se obtiene de la ficha abierta y la prenda se selecciona por nombre. Se eliminó la búsqueda de cliente por nombre redundante en Nuevo alquiler, sustituida por el DNI con nombre resuelto.

**No se eliminaron columnas, registros ni atributos del backend.** Tampoco se eliminó la entidad de detalle: sigue siendo necesaria para conservar prendas, cantidades y precios históricos del alquiler. Se eliminó su uso como pantalla independiente.

## Cálculos y límites del backend

No se encontró el código del backend entre los proyectos disponibles. No se añadieron ni modificaron fórmulas de totales, subtotales, penalidades, pagos o saldos. Se mantienen los importes y contratos existentes; no se certifica que el servidor recalcule automáticamente esos importes.

El contrato actual de devolución contiene `alquilerId`, pero no un detalle de recepción por prenda. Por eso la revisión por prenda se conserva en la observación, como texto legible, y no como una nueva relación estructurada. Las recepciones incompletas no se ofrecen como origen de mantenimiento porque el servidor no identifica de forma estructurada qué prendas de ellas fueron recibidas.

El contrato de mantenimiento contiene `prendaId`, pero no `devolucionId`. El origen se valida en la interfaz y se conserva en la descripción; no equivale a una clave foránea ni a una validación del servidor. Para trazabilidad estructurada, devoluciones parciales y restricciones fiables entre usuarios concurrentes, el backend necesita admitir esas relaciones y validar disponibilidad por fechas.

La revisión y las observaciones tienen el límite actual de 500 caracteres; el mantenimiento, 255 caracteres de descripción. Si no caben, se avisa y no se recorta ni se pierde información silenciosamente.

## Verificación

Se ejecutaron la compilación de producción y las pruebas automatizadas del proyecto. Las pruebas cubren DNI exacto con ceros iniciales, exclusión de prendas inactivas, historial de clientes homónimos, recepción vinculada al alquiler, reservas aún no entregadas, recepción incompleta y selección de prendas desde una devolución de origen, además de los casos previos de catálogo y agenda.

No se realizaron escrituras de prueba contra la API real ni se certificó el comportamiento transaccional del backend. La advertencia de tamaño del CSS de empleados ya existía antes de este ajuste.

Todos los cambios se mantienen en `feature/cambairdiseñovisual`.
