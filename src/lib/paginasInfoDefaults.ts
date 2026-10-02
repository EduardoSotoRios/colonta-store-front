import type { PaginaInfoSlug } from "./paginasInfo";

export type SeccionDefault = { titulo: string; cuerpo: string };
export type PaginaInfoDefault = { titulo: string; subtitulo: string | null; secciones: SeccionDefault[] };

// Copia del contenido actual (hardcodeado) de cada página, usada SOLO para
// precargar el editor de Admin > Mantenimiento la primera vez que se abre
// (antes de que exista una fila en paginas_contenido). Las páginas públicas
// NO usan este archivo — ellas siguen mostrando su JSX original tal cual
// hasta que el admin guarde cambios de verdad.
export const PAGINAS_INFO_DEFAULTS: Record<PaginaInfoSlug, PaginaInfoDefault> = {
  garantia: {
    titulo: "Garantía",
    subtitulo: "Atención Colonta",
    secciones: [
      {
        titulo: "ITEM - GARANTÍA",
        cuerpo:
          "Todos nuestros productos Colonta cuentan con **6 meses de garantía de fabricación** desde que los recibes. Si notas que tu producto tiene algún defecto de fabricación que no sea por un uso inapropiado, ¡no te preocupes! podrás cambiarlo por el mismo producto, uno similar o solicitar la devolución de tu dinero de forma rápida y sencilla.\n" +
          "Queremos que tu experiencia con Colonta siempre sea positiva.\n" +
          "1. Escríbenos explicando la situación y adjuntando tu comprobante de compra (lo enviamos a tu mail al momento de concretar la compra).\n" +
          "2. Nuestro equipo revisará tu caso en un máximo de **5 días hábiles** para confirmar si se trata de un defecto de fabricación.\n" +
          "3. Una vez que validemos el defecto de fabricación, podrás elegir entre cambiar el producto, repararlo o recibir la devolución de tu dinero.\n" +
          "* El costo del retiro queda sujeto a evaluación, te informaremos al término de esta. *\n" +
          "> **Nuestro compromiso** es darte una respuesta en un máximo de **10 días hábiles** desde que aceptamos tu solicitud. Queremos que tu experiencia sea fácil y sin complicaciones. >",
      },
      {
        titulo: "CAMBIOS",
        cuerpo:
          "He tenido una falla técnica con mi Colonta\n" +
          "Todos nuestros productos Colonta cuentan con **6 meses de garantía de fabricación** desde que los recibes. Si notas que tu producto tiene algún defecto de fabricación que no sea por un uso inapropiado, ¡no te preocupes! podrás cambiarlo por el mismo producto, uno similar o solicitar la devolución de tu dinero de forma rápida y sencilla.\n" +
          "Queremos que tu experiencia con Colonta siempre sea positiva.\n" +
          "1. Escríbenos explicando la situación y adjuntando tu comprobante de compra (lo enviamos a tu mail al momento de concretar la compra).\n" +
          "2. Nuestro equipo revisará tu caso en un máximo de **5 días hábiles** para confirmar si se trata de un defecto de fabricación.\n" +
          "3. Una vez que validemos el defecto de fabricación, podrás elegir entre cambiar el producto, repararlo o recibir la devolución de tu dinero.\n" +
          "* El costo del retiro queda sujeto a evaluación, te informaremos al término de esta. *\n" +
          "> **Nuestro compromiso** es darte una respuesta en un máximo de **10 días hábiles** desde que aceptamos tu solicitud. Queremos que tu experiencia sea fácil y sin complicaciones. >",
      },
      {
        titulo: "DEVOLUCIONES",
        cuerpo:
          "Quiero regresar mi Colonta\n" +
          "Si tu Colonta escogida no cumplió tus expectativas puedes devolverla en un plazo máximo de **10 días** desde que la recibiste, te contamos cuales son los requisitos:\n" +
          "➢ Queremos que tu experiencia sea excelente, por eso, para gestionar una devolución, el producto debe estar **sin uso, limpio, con etiquetas y embalajes originales, en perfecto estado**.\n" +
          "➢ Si el producto ha sido usado o probado, solo podremos ofrecer la devolución del dinero si se trata de un **defecto de fabricación confirmado** por nuestro Servicio Técnico.\n" +
          "➢ Recuerda: después de los **10 días** desde que recibes tu pedido, no podemos hacer devoluciones ni cambios por razones de gustos o preferencias personales.\n" +
          "➢ Todos los plazos empiezan a contarse desde el momento en que recibes tu producto, así tendrás todo claro y sin sorpresas.\n" +
          "Queremos que tu experiencia con Colonta sea siempre positiva. Si necesitas solicitar la devolución de tu dinero, estaremos encantados de ayudarte en el proceso:\n" +
          "1. Contáctanos contándonos el motivo de tu devolución. Te pediremos completar un pequeño formulario y adjuntar tu comprobante de compra para poder gestionar tu solicitud.\n" +
          "2. Nuestro equipo revisará tu caso en un máximo de **2 días hábiles** y te confirmaremos, por el mismo medio los pasos para coordinar el retiro o envío del producto de vuelta.\n" +
          "3. Una vez recibido el producto en nuestras instalaciones, verificaremos en un plazo máximo de **2 días** que cumpla con los requisitos de devolución. Luego realizaremos el reembolso a la cuenta que nos indiques.\n" +
          "* No podemos hacer devoluciones en efectivo de las compras realizadas mediante la página web.\n" +
          "El costo del retiro queda sujeto a evaluación, te informaremos al término de esta. *",
      },
      {
        titulo: "REPARACIONES",
        cuerpo:
          "Me gustaría reparar mi Colonta\n" +
          "Si tu Colonta ha presentado alguna falla técnica externa, podemos repararla para que siga acompañándote por mucho tiempo más. Queremos que disfrutes de su compañía y que juntos prolonguemos su vida útil, siempre buscando la solución más conveniente para ti.\n" +
          "Contáctanos por WhatsApp contándonos que necesitas reparar, probablemente te pediremos imágenes, te daremos alternativas y costos para que tomes la mejor opción para ti.\n" +
          "Algunas veces reparar tu Colonta no es tan conveniente, y te recomendaremos la opción de reutilización, reciclaje o recuperación (retiramos tu Colonta para darle una segunda vida en otros productos).\n" +
          "> \"Gracias por confiar en Colonta. Cada pieza está hecha con amor y dedicación, queremos que la disfrutes plenamente. Si alguna vez necesitas un cambio, devolución o reparación, recuerda que estamos aquí para acompañarte en cada paso. Tu satisfacción y confianza son parte esencial de nuestra esencia.\" >",
      },
    ],
  },

  "politica-compra": {
    titulo: "Política de Compra",
    subtitulo: "Términos y Condiciones",
    secciones: [
      {
        titulo: "Pedidos y confirmación",
        cuerpo:
          "En Colonta queremos que tu experiencia sea simple y tranquila desde el primer momento. Cuando realizas un pedido a través de nuestra tienda online:\n" +
          "• Recibirás una confirmación automática por correo electrónico con los detalles de tu compra, incluyendo los productos, cantidades, precio total, plazos de entrega y esta política de compra que aquí enumeramos.\n" +
          "• Nuestro plazo de fabricación de productos es un máximo dos semanas, te daremos aviso del plazo estimado por whatsapp y mail dentro de las 24 primeras horas posteriores a tu compra. Cada pedido se procesa en orden de recepción, queremos asegurarnos de preparar y enviar tus productos con cuidado y dedicación.\n" +
          "• Te recomendamos revisar con atención la información de tu pedido y dirección de despacho, contacto y plazos para evitar cualquier inconveniente en la entrega.\n" +
          "• Si detectas algún error o deseas hacer modificaciones, contáctanos lo antes posible a través de nuestro formulario de contacto, y con gusto te ayudaremos a corregirlo.",
      },
      {
        titulo: "Precios y pagos",
        cuerpo:
          "Compromiso de compra transparente y sin sorpresas:\n" +
          "• Todos los precios de nuestros productos Colonta incluyen impuestos vigentes, y se muestran en pesos chilenos (CLP) en nuestra tienda online.\n" +
          "• Los métodos de pago disponibles son tarjeta de crédito/débito (Onepay). Cada transacción se realiza a través de plataformas confiables para proteger tu información.\n" +
          "• El cobro del producto se realiza en el momento de confirmar tu pedido, asegurando que tu compra quede reservada.\n" +
          "• En caso de descuentos, promociones o códigos de cupón, el precio final refleja la oferta vigente al momento de la compra.\n" +
          "• Si surge algún error en el precio publicado, nos comunicaremos contigo de inmediato antes de procesar tu pedido para explicarte la situación y ofrecer la mejor solución posible.",
      },
      {
        titulo: "Envíos y tiempos de entrega",
        cuerpo:
          "En Colonta cuidamos cada detalle para que tus productos lleguen a tus manos de manera segura y puntual:\n" +
          "• Todos los pedidos son procesados con cariño y atención antes de ser enviados.\n" +
          "• El tiempo estimado de entrega dependerá de tu ubicación y será informado al momento de tu compra junto con el valor de este, te sugerimos revisar el cuadro informativo más abajo para tener un valor y plazo estimado de entrega.\n" +
          "• Los envíos se realizan a través de empresas transportistas confiables, te damos la opción de elegir en la R.M la empresa que quieres que te despache, hacemos lo posible por asegurar que tu pedido llegue en las mejores condiciones.\n" +
          "• Una vez despachado tu pedido, recibirás un correo de seguimiento con los datos del envío para que puedas monitorear su progreso.\n" +
          "• No nos es posible asumir responsabilidades por retrasos ocasionados por circunstancias externas al envío (clima, transportistas, días festivos), pero siempre hacemos nuestro mejor esfuerzo para mantenerte informado y apoyarte si surge algún inconveniente.\n" +
          "• Si tu pedido llegara dañado o incompleto, por favor contáctanos de inmediato; nuestro compromiso es encontrar una solución rápida y satisfactoria para ti.",
      },
      {
        titulo: "Responsabilidades de Colonta y de nuestros clientes",
        cuerpo:
          "En Colonta creemos en la confianza mutua. Por eso, es importante que tanto nosotros como tú tengamos claras nuestras responsabilidades:\n" +
          "**Responsabilidades de Colonta**\n" +
          "• Cumplir con lo ofrecido en la tienda online, respetando precios, promociones, materiales y características de cada producto.\n" +
          "• Preparar y despachar los pedidos con cuidado y dedicación que representan a nuestra marca.\n" +
          "• Informar de manera clara y oportuna los tiempos de entrega, políticas de cambio y devoluciones.\n" +
          "• Responder en caso de que un producto presente fallas de fabricación o errores en el despacho, buscando siempre la solución más justa para ti y cumpliendo con lo estipulado en la Ley chilena N° 19.496 protección de los derechos de los consumidores.\n" +
          "• Proteger tus datos personales y utilizarlos únicamente para fines relacionados con tu compra, despacho y experiencia en Colonta. No compartimos información confidencial de tus compras ni de tu cuenta privada con ninguna entidad ni persona natural.\n" +
          "**Responsabilidades de nuestros clientes**\n" +
          "• Entregar información veraz y completa al momento de la compra, especialmente en lo referente a datos de contacto y dirección de entrega.\n" +
          "• Revisar los detalles de su pedido al recibir la confirmación, para asegurarse de que la información sea correcta.\n" +
          "• Cuidar el producto recibido y, en caso de cambios o devoluciones, enviarlo en las mismas condiciones en que fue entregado.\n" +
          "• Respetar los plazos establecidos para solicitar cambios, devoluciones o ejercer el derecho a retracto.",
      },
      {
        titulo: "Protección de datos y privacidad",
        cuerpo:
          "En Colonta cuidamos de tu confianza tanto como de nuestros productos. Sabemos que tu información personal es valiosa y por eso nos comprometemos a protegerla con responsabilidad y respeto.\n" +
          "• Los datos que nos entregues al momento de comprar (como tu nombre, dirección, correo electrónico o teléfono) serán utilizados únicamente para gestionar tu pedido, despachar correctamente y mantenerte informado sobre tu compra.\n" +
          "• No compartiremos tu información con terceros, salvo con las empresas de transporte que realizan la entrega y únicamente para cumplir con el envío.\n" +
          "• Podrás solicitar en cualquier momento la modificación o eliminación de tus datos personales de nuestros registros escribiéndonos a nuestro correo de contacto.\n" +
          "• Si decides suscribirte a nuestro boletín o lista de novedades, recibirás información sobre lanzamientos, promociones y contenido especial de Colonta. Siempre tendrás la opción de darte de baja fácilmente si así lo deseas.\n" +
          "• Nos comprometemos a resguardar tu información utilizando plataformas de pago y sistemas seguros que protegen tus transacciones.",
      },
      {
        titulo: "",
        cuerpo:
          "> En Colonta cada producto es más que un objeto, es una pieza que acompaña tu camino, hecha con dedicación, responsabilidad medioambiental y respeto. Nuestros Términos y Condiciones buscan simplemente dar claridad y confianza para que tu experiencia de compra sea transparente, segura y alineada con los valores que nos inspiran.\n" +
          "Al elegir Colonta, no solo recibes un producto, sino también el cariño y la intención con que ha sido creado. Gracias por confiar en nosotras y ser parte de esta comunidad que valora lo auténtico, lo consciente y lo hecho con el corazón. >",
      },
    ],
  },

  "preguntas-frecuentes": {
    titulo: "Preguntas Frecuentes",
    subtitulo: null,
    secciones: [
      {
        titulo: "¿Cómo puedo hacer una Compra?",
        cuerpo: "Puedes comprar directamente en nuestra tienda online seleccionando el producto que te guste y siguiendo los pasos de pago. Si necesitas ayuda, puedes escribirnos por nuestros canales oficiales y con gusto te guiaremos.",
      },
      {
        titulo: "¿Puedo cambiar o devolver un producto?",
        cuerpo: "Sí, lo más importante es que te sientas feliz con tu compra. Consulta nuestras Políticas de Cambios y Devoluciones para conocer los plazos y condiciones.",
      },
      {
        titulo: "¿Los productos Colonta tienen garantía de fabricación?",
        cuerpo: "Sí, todos los productos Colonta cuentan con **6 meses de garantía de fabricación** desde que los recibes. Si notas que tu producto tiene algún defecto de fabricación que no sea por un uso inapropiado, ¡no te preocupes! podrás cambiarlo por el mismo producto, uno similar o solicitar la devolución de tu dinero de forma rápida y sencilla. Consulta nuestras Políticas de Garantía para conocer los plazos y condiciones.",
      },
      {
        titulo: "¿En cuánto tiempo recibiré mi compra Colonta?",
        cuerpo: "Todos nuestros productos son únicos y están creados con amor y dedicación, posterior a tu compra te contactaremos para darte aviso del estado de tu pedido, nuestro plazo máximo de entrega es de **dos semanas**. Durante todo el proceso te estaremos acompañando.",
      },
      {
        titulo: "¿Cuáles son los medios de pagos?",
        cuerpo: "Puedes pagar tu compra con **Onepay (débito o crédito)**. Todos los pagos son seguros y deben estar confirmados antes de preparar tu pedido.",
      },
      {
        titulo: "Me falló el pago en Onepay ¿Por qué? ¿Qué puedo hacer?",
        cuerpo:
          "Algunas veces los sistemas de pago presentan problemas de conexión esporádicos. Si tu compra es rechazada por favor intenta nuevamente luego de unos minutos. El problema debería resolverse y la compra podrá procesarse sin problemas.\n" +
          "Si tu compra aparece como rechazada y el cargo fue realizado a tu cuenta bancaria, se puede deber a problemas de sincronización internos de Transbank. Los montos cargados a tu cuenta serán devueltos hasta **72 horas hábiles**, si no sucede por favor ponte en contacto con nosotros.",
      },
      {
        titulo: "¿Cómo funcionan los envíos?",
        cuerpo:
          "Una vez confirmado tu pago, preparamos tu pedido con dedicación y cuidado. El tiempo de entrega depende de tu ubicación, pero siempre te informaremos el plazo estimado antes de confirmar tu compra. Puedes revisar en el apartado Política de Compra los plazos de las empresas de despacho, si tienes dudas puedes escribirnos.\n" +
          "Te pedimos que si tu despacho está abierto o con algún tipo de daño lo rechaces y nos des aviso de inmediato por favor, buscaremos cómo resolverlo con prioridad.",
      },
      {
        titulo: "¿Cómo le hago seguimiento a mi pedido?",
        cuerpo: "Al momento de despachar tu compra Colonta te daremos aviso del plazo y el número de seguimiento para que puedas rastrearlo.",
      },
      {
        titulo: "¿Puedo cambiar la dirección de mi pedido si ya fue ingresado?",
        cuerpo: "Sí, puedes generar el cambio de dirección aun cuando ya esté ingresado, solo debes entrar a la página web del delivery, te enviamos un mail con el nombre de la empresa y el número de seguimiento.",
      },
      {
        titulo: "¿Puedo hablar directamente con la persona que despacha?",
        cuerpo: "No, desafortunadamente no es posible tener un contacto directo con la persona encargada de hacer la entrega, pero si puedes ponerte en contacto con la empresa repartidora, te enviamos el nombre y el número de seguimiento.",
      },
      {
        titulo: "¿Puedo personalizar un producto diferente que no está publicado en la página?",
        cuerpo: "Claro, puedes personalizar un producto, contáctanos y cuéntanos qué tienes en mente para nosotros, queremos que tu experiencia sea única.",
      },
      {
        titulo: "¿Cómo hacer válido un cupón de descuento?",
        cuerpo: "Si tienes un cupón de descuento y quieres hacerlo válido debes ingresarlo en el apartado que dice \"Tengo un código de descuento\" al momento de hacer el pago.",
      },
      {
        titulo: "¿Cómo funcionan las GiftCard?",
        cuerpo: "Al momento de tu compra te haremos llegar por mail tu GiftCard, puede elegir una GiftCard con un valor específico o elegir la mochila que quieres regalar, danos aviso si es un regalo incognito.",
      },
      {
        titulo: "Tengo una GiftCard, ¿cómo puedo activarla?",
        cuerpo: "Al momento de realizar el pago de tu compra debes seleccionar la opción \"Tengo un código\", digitar los números de tu GiftCard y se realizará el descuento de inmediato.",
      },
    ],
  },
  // Página nueva (no existía antes), sin diseño original que preservar —
  // este es el borrador inicial, pensado para que el admin lo ajuste desde
  // Mantenimiento.
  "como-comprar": {
    titulo: "¿Cómo comprar?",
    subtitulo: "Guía rápida para comprar en Colonta",
    secciones: [
      {
        titulo: "PASO A PASO",
        cuerpo:
          "1. Elige tu mochila en el catálogo y revisa los colores y detalles disponibles.\n" +
          "2. Si quieres, personalízala con tu nombre o un diseño propio desde la sección Personalizar.\n" +
          "3. Agrégala al carrito y revisa que la cantidad y el color sean los correctos.\n" +
          "4. Ve al checkout y completa tus datos de envío y contacto.\n" +
          "5. Paga de forma segura con Webpay.\n" +
          "6. Te enviaremos un correo con la confirmación y el número de tu pedido.\n" +
          "7. Sigue el estado de tu pedido en cualquier momento desde la sección Seguimiento.\n" +
          "* Si tienes dudas durante el proceso, puedes escribirnos por WhatsApp y te ayudamos a completar tu compra. *\n" +
          "> Hacemos envíos a todo Chile y aceptamos pagos con Webpay. >",
      },
    ],
  },
  despacho: {
    titulo: "Despacho",
    subtitulo: "Cómo llegan tus productos a tu puerta",
    secciones: [
      {
        titulo: "ENVÍOS Y TIEMPOS DE ENTREGA",
        cuerpo:
          "Hacemos envíos a todo Chile a través de Blue Express.\n" +
          "Nuestro plazo de fabricación es de un máximo de **2 semanas**; te avisaremos el plazo estimado por WhatsApp y correo dentro de las primeras 24 horas después de tu compra.\n" +
          "El costo y tiempo estimado de envío dependen de tu ubicación y del punto Blue Express que elijas — se calculan automáticamente al momento de pagar, antes de confirmar tu compra.\n" +
          "Una vez despachado tu pedido, te enviaremos un correo de seguimiento para que puedas revisar su estado en cualquier momento desde la sección Seguimiento.\n" +
          "* No podemos responsabilizarnos por retrasos ocasionados por factores externos al envío (clima, feriados, transportista), pero siempre hacemos lo posible por mantenerte informado y ayudarte si surge un inconveniente. *\n" +
          "> Si tu pedido llega dañado o incompleto, contáctanos de inmediato — buscaremos la solución más rápida para ti. >",
      },
    ],
  },
  "metodos-pago": {
    titulo: "Métodos de pago",
    subtitulo: "Formas seguras de pagar tu compra",
    secciones: [
      {
        titulo: "CÓMO PUEDES PAGAR",
        cuerpo:
          "- Tarjetas de crédito y débito a través de **Webpay**, la pasarela de pago segura más usada en Chile.\n" +
          "- Cupones de descuento: ingresa tu código en el paso de pago, en el campo \"Cupón de descuento\".\n" +
          "- GiftCard: si tienes una, actívala en el mismo paso ingresando su código.\n" +
          "* Si tu pago es rechazado o cancelado, puedes intentarlo nuevamente desde el checkout sin perder los productos de tu carrito. *",
      },
    ],
  },
};
