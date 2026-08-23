# Revisión de `_mockup.html` — 2026-08-22

Revisión hecha desde la sesión que lleva el posicionamiento y la metadata de las
tiendas. Verificada contra el `_mockup.html` **de este día** (no una versión
anterior) y contra el código real de `Pampa/Aura`.

Se deja escrito aquí a propósito: las sesiones de Claude se cierran y los
hallazgos no deben vivir sólo en un mensaje entre sesiones.

---

> **Estado a 2026-08-22 — LOS TRES CERRADOS. No hay nada que hacer aquí.**
> 1 y 3 se corrigieron en el `_mockup.html` (verificado: 0 apariciones de
> "instagram", 0 emoji en todo el fichero). El 2 lo resolvió Pedro confirmando
> que **los cuatro productos, anuales incluidos, están activos y son
> comprables** — el copy de precios se queda como está.
>
> Se deja escrito el razonamiento porque explica *por qué* cada corrección es la
> correcta, no para pedir trabajo otra vez.

## ✅ 1 · "Enlace de Instagram" era falso — CORREGIDO (líneas 219, 229)

La página promete, en el pilar 1, *"…Instagram. Aura lo lee, lo entiende y lo
deja listo"*, más un chip `🔗 Enlace de Instagram`.

**La app no hace eso.** `shared/.../feature/share/ShareLinkParser.kt` acepta
únicamente `https://aura.pampaiter.com/share/<token>` — busca literalmente
`/share/` en la cadena. Un grep de "instagram" sobre `shared/src`,
`composeApp/src` y `server/src` devuelve un solo acierto, y es un comentario en
`ShareCardScaffold.kt` sobre el formato 9:16 de las Stories.

El import por enlace es para **un WOD que alguien compartió desde Aura**.

Es peligroso precisamente porque suena plausible: los boxes publican los WODs en
Instagram, así que el primer usuario lo intentará el día uno y fallará.

**Sugerencia:** *"pega el enlace que te pasó tu box"*.

## ✅ 2 · Precios anuales — RESUELTO: están activos, el copy se queda

> **Pedro confirmó el 2026-08-22 que los anuales están activos y son
> comprables.** `34,99 €/año` y `89,99 €/año` (`aura_plus_yearly_3` /
> `aura_pro_yearly_3`) se quedan tal cual en las líneas 455 y 471.
>
> **La duda la causó documentación desactualizada, no el copy** — y eso ya está
> arreglado en el repo de la app: `ops/monetization_setup.md` tenía los pasos
> "Activar" sin marcar y `agents/CLAUDE.md` listaba los anuales como "(Future)".
> Ambos corregidos el 2026-08-22. Si alguien vuelve a dudar de esto, la
> documentación ya dice la verdad.

Se anuncian `34,99 €/año` y `89,99 €/año` ("ahorras ~42%"). Esos importes **no
aparecen en el repo de la app**.

El cliente sí soporta anual (`BillingPeriod.ANNUAL` → `$rc_annual` en
`SubscriptionViewModel`) e incluso contempla *"a non-buyable plan, e.g. annual
when no annual product"*. Y el playbook de RevenueCat en `agents/CLAUDE.md`
lista los productos reales como `aura_plus_monthly_1` / `aura_pro_monthly_2`,
con los anuales marcados como **"(Future) `aura_plus_yearly_X`,
`aura_pro_yearly_X`"**.

**Acción:** verificar en RevenueCat + App Store Connect si los productos anuales
existen. Si no, quitar el anual y dejar sólo mensual. Anunciar un precio que no
se puede comprar es peor que no anunciarlo.

## ✅ 3 · Emoji en lugar del sistema de iconos — CORREGIDO (líneas 228-231)

`📸 🔗 ⏱️ ✍️` como marcadores de feature. Aura tiene 48 iconos propios
(`AuraIcons.kt`) y una "Icon Rule" escrita en `agents/CLAUDE.md` que prohíbe
inventar iconos. Los SVG originales están en `Pampa/AURA-DOCS/aura_icons/`,
por categorías.

Emoji del sistema operativo desentona con una app cuya identidad visual es
justamente lo más cuidado que tiene, y lee como plantilla genérica.

## ⚪ Apunte menor — badge "TU COACH IA" (sección 02)

No es un error: los insights existen y son de Plus. Pero destacar "coach IA"
como elemento visual en el rediseño cuyo motivo era **dejar de vender eso**
trabaja en contra del propio cambio. Mejor en la prosa que en un badge.

---

## Verificado y correcto

- **Cuotas 8 / 80 / 150** contrastadas contra `AiPlan.kt` — exactas
  (`imageImportLimit` FREE 8, PLUS 80, PRO 150).
- **Pizarra**: encuadre honesto y en singular. Correcto — está publicada desde
  v1.2.1 sin feature flag, y su punto de entrada real es
  `sourceSharedLinkToken != null`, o sea sólo dentro de una sesión importada de
  un link. No es un ranking de extraños y la página ya no lo dice.
- **Jerarquía de precios** (Free → Plus → Pro, sin "Most popular" en Pro, sin
  hacer héroe a la planning): respaldada por `DECISIONS.md` 2026-07-23, "rol de
  la planning: escalón Pro, no puerta".

## Contexto que conviene no perder

- **No prometer el import de semana.** Va en v1.2.2, que a 2026-08-22 está **en
  revisión** (lo publicado en iOS es 1.2.1), y **nunca se ha probado de extremo
  a extremo en un device**. Fuera de la landing hasta que se cumplan las dos
  condiciones.
- **Compartir una semana se ve mal en producción**: el fix del board plano tiene
  la mitad de servidor sin desplegar (prod iba 54 commits por detrás). Compartir
  un WOD suelto sí funciona — de ahí el singular.
- **No lanzar `recordRoborazziStagingDebug`** para sacar imágenes: no genera,
  **aprueba** las referencias del gate de regresión visual.
- **Nombres por storefront** (el título se localiza por idioma en ambas
  tiendas): ES `Aura: El WOD de hoy` · EN `Aura: HYROX & WOD Timer`.
- **Línea de posicionamiento operativa:** "El WOD de tu box, en tu móvil en
  segundos." / "Your box's WOD, on your phone in seconds."
