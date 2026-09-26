/**
 * Modo demostración.
 *
 * Con DEMO_MODE activo (valor por defecto, p. ej. en la vista previa de Lovable) la app
 * arranca con datos de ejemplo (Ricardo, Víctor, el arriendo de la Sra. Yolanda, la
 * natillera de la oficina…) y muestra frases de ejemplo en el asistente de voz.
 *
 * Para el lanzamiento real se desactiva con VITE_DEMO_MODE=false (ver .env.lanzamiento
 * y los scripts `dev:lanzamiento` / `build:lanzamiento`): la app empieza vacía y le pide
 * al usuario sus propios datos.
 */
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== "false";
