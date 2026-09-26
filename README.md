# AgendIA: Tu Aliado Financiero

Prompt 1 · Base de la app

Crea una web app llamada AgendIA-UIB que funcione como agenda personal y asistente para manejar las finanzas personales, pensada para personas muy ocupadas en Colombia, pequeños negocios y fundaciones. Lema: "Tu agenda y asistente personal".

Diseño y estética

Colores: azul principal 
#1F55E3, turquesa 
#12A5A5, coral 
#F2644A (acentos y micrófono), verde 
#1E7A4F (ingresos y ahorro), fondo 
#F5F7F3, tarjetas blancas, texto 
#16213D.
Degradado de marca para tarjetas destacadas: 
#1F55E3 → 
#1C6FCB → 
#12A5A5.
Tipografías: Lexend para títulos, Source Sans 3 para texto, IBM Plex Mono para montos y horas.
Motivo gráfico: una onda suave que evoca el río Atrato (Quibdó) en la parte baja de las tarjetas destacadas.
No uses aviones, aeropuertos, vuelos ni pases de abordar.
Montos en pesos colombianos con formato $1.250.000 (punto de miles, sin decimales).
Modo claro y modo oscuro.

Navegación Barra inferior con Inicio, Agenda, un botón central grande de micrófono en coral, Finanzas y Más. "Más" abre Reuniones, Asistente, Facturas, WhatsApp, Planes y Ajustes.

Páginas y funcionalidades

Bienvenida (primera vez): logo, "Bienvenido a AgendIA", campo "¿Cómo quieres que te llame?", tono del saludo (Cercano o Formal), elegir tipos de frases (Finanzas, Bíblicas, Filosofía) y botón "Empezar".
Inicio: fecha y "Quibdó"; saludo según la hora con el nombre ("¡Buenos días, Ricardo! Hoy tienes 2 compromisos y 1 pago en camino. Vamos con toda."); tarjeta "Lo próximo" con el siguiente evento y 4 cifras (citas, pagos, tareas, disponible); tarjeta "Frase del día" con botones Otra frase, Guardar y Compartir; accesos rápidos (Grabar reunión, Preguntar al asistente, Guardar factura, Registrar gasto); lista de hoy y pagos que vienen.
Agenda: franja de 7 días, eventos del día con hora, lugar y su recordatorio ("Alarma 1 día, 1 hora y 15 min antes"), tareas con casillas y listas de compras por tienda.
Finanzas: tarjeta de dinero disponible con saldos de Bancolombia, Nequi y Efectivo; ingresos y gastos del mes; pestañas:
Gastos: presupuesto por categoría con barras que se vuelven coral al pasar el 90 %.
Ingresos.
Deudas: lo que debo y lo que me deben, con porcentaje pagado.
Ahorro: natilleras con cuota, próxima fecha, fecha de liquidación y botón "Pagar cuota"; metas de ahorro con cuánto ahorrar por quincena.
Arriendo: valor, día de pago, arrendador, estado e historial.
Compras. Cada movimiento muestra cómo se pagó: Nequi, Bancolombia, Bre-B, Efectivo o Tarjeta.
Ajustes: nombre, tono, tipos de frases y cada cuánto cambian (una vez al día, cada 6 horas, cada vez que abro la app), recordatorios por defecto, simular "sin internet" y restablecer datos.

Frases del día: que no se repitan hasta haber mostrado todas. Para las bíblicas usa la versión Reina-Valera 1909. Ejemplos:

"Encomienda a Jehová tus obras, y tus pensamientos serán afirmados." (Proverbios 16:3)
"Jehová es mi pastor; nada me faltará." (Salmos 23:1)
"No ahorres lo que queda después de gastar; gasta lo que queda después de ahorrar." (Warren Buffett)
"Cuentas claras, amistades largas." (Refrán popular)
"No es que tengamos poco tiempo, sino que perdemos mucho." (Séneca)
"Nadie se baña dos veces en el mismo río." (Heráclito)

Datos de prueba

Usuario: Ricardo.
Reunión con Víctor hoy a las 3:00 pm en el Salón Fiama.
"Fiestas de San Pacho con la familia" en el Malecón de Quibdó dentro de 2 días.
Deudas: "Crédito del teléfono" (saldo $400.000, cuota $100.000) y "Tarjeta de crédito".
Juan Carlos me debe $100.000.
Natillera de la oficina: $20.000 semanal, 18 miembros.
Metas: "Moto nueva" ($4.000.000) y "Fondo de emergencias".
Arriendo: $850.000 el día 30, arrendadora Sra. Yolanda Mosquera.

Notas importantes

Mobile first: pensada para celular (390 px de ancho); en computador se ve centrada dentro de un marco de teléfono.
Diseño profesional, limpio y cálido, con botones grandes y fáciles de tocar.
Todo el texto en español de Colombia.
Los datos se mantienen al recargar la página.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b052a7f1-e8ce-46d5-ae93-3561065ea40f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
