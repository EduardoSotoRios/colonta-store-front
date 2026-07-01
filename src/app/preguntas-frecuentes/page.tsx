import Link from "next/link";

export default function PreguntasFrecuentesPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-colonta-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/" className="text-white/80 hover:text-white text-sm mb-2 inline-block">
            ← Volver al inicio
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold">Preguntas Frecuentes</h1>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl ring-1 ring-black/5 p-6 md:p-8 bg-white space-y-8">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-2 text-slate-900">¿Cómo puedo hacer una Compra?</h2>
                <p className="text-slate-700">
                  Puedes comprar directamente en nuestra tienda online seleccionando el producto que te guste y siguiendo los pasos de pago. Si necesitas ayuda, puedes escribirnos por nuestros canales oficiales y con gusto te guiaremos.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-2 text-slate-900">¿Puedo cambiar o devolver un producto?</h2>
                <p className="text-slate-700">
                  Sí, lo más importante es que te sientas feliz con tu compra. Consulta nuestras <Link href="/cambios" className="text-colonta-primary hover:underline">Políticas de Cambios</Link> y <Link href="/devoluciones" className="text-colonta-primary hover:underline">Devoluciones</Link> para conocer los plazos y condiciones.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-2 text-slate-900">¿Los productos Colonta tienen garantía de fabricación?</h2>
                <p className="text-slate-700">
                  Sí, todos los productos Colonta cuentan con <strong>6 meses de garantía de fabricación</strong> desde que los recibes. Si notas que tu producto tiene algún defecto de fabricación que no sea por un uso inapropiado, ¡no te preocupes! podrás cambiarlo por el mismo producto, uno similar o solicitar la devolución de tu dinero de forma rápida y sencilla. Consulta nuestras <Link href="/garantia" className="text-colonta-primary hover:underline">Políticas de Garantía</Link> para conocer los plazos y condiciones.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-2 text-slate-900">¿En cuánto tiempo recibiré mi compra Colonta?</h2>
                <p className="text-slate-700">
                  Todos nuestros productos son únicos y están creados con amor y dedicación, posterior a tu compra te contactaremos para darte aviso del estado de tu pedido, nuestro plazo máximo de entrega es de <strong>dos semanas</strong>. Durante todo el proceso te estaremos acompañando.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-2 text-slate-900">¿Cuáles son los medios de pagos?</h2>
                <p className="text-slate-700">
                  Puedes pagar tu compra con <strong>Onepay (débito o crédito)</strong>. Todos los pagos son seguros y deben estar confirmados antes de preparar tu pedido.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-2 text-slate-900">Me falló el pago en Onepay ¿Por qué? ¿Qué puedo hacer?</h2>
                <p className="text-slate-700 mb-2">
                  Algunas veces los sistemas de pago presentan problemas de conexión esporádicos. Si tu compra es rechazada por favor intenta nuevamente luego de unos minutos. El problema debería resolverse y la compra podrá procesarse sin problemas.
                </p>
                <p className="text-slate-700">
                  Si tu compra aparece como rechazada y el cargo fue realizado a tu cuenta bancaria, se puede deber a problemas de sincronización internos de Transbank. Los montos cargados a tu cuenta serán devueltos hasta <strong>72 horas hábiles</strong>, si no sucede por favor ponte en contacto con nosotros.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-2 text-slate-900">¿Cómo funcionan los envíos?</h2>
                <p className="text-slate-700">
                  Una vez confirmado tu pago, preparamos tu pedido con dedicación y cuidado. El tiempo de entrega depende de tu ubicación, pero siempre te informaremos el plazo estimado antes de confirmar tu compra. Puedes revisar en el apartado <Link href="/politica-compra" className="text-colonta-primary hover:underline">Política de Compra</Link> los plazos de las empresas de despacho, si tienes dudas puedes escribirnos.
                </p>
                <p className="text-slate-700 mt-2">
                  Te pedimos que si tu despacho está abierto o con algún tipo de daño lo rechaces y nos des aviso de inmediato por favor, buscaremos cómo resolverlo con prioridad.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-2 text-slate-900">¿Cómo le hago seguimiento a mi pedido?</h2>
                <p className="text-slate-700">
                  Al momento de despachar tu compra Colonta te daremos aviso del plazo y el número de seguimiento para que puedas rastrearlo.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-2 text-slate-900">¿Puedo cambiar la dirección de mi pedido si ya fue ingresado?</h2>
                <p className="text-slate-700">
                  Sí, puedes generar el cambio de dirección aun cuando ya esté ingresado, solo debes entrar a la página web del delivery, te enviamos un mail con el nombre de la empresa y el número de seguimiento.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-2 text-slate-900">¿Puedo hablar directamente con la persona que despacha?</h2>
                <p className="text-slate-700">
                  No, desafortunadamente no es posible tener un contacto directo con la persona encargada de hacer la entrega, pero si puedes ponerte en contacto con la empresa repartidora, te enviamos el nombre y el número de seguimiento.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-2 text-slate-900">¿Puedo personalizar un producto diferente que no está publicado en la página?</h2>
                <p className="text-slate-700">
                  Claro, puedes personalizar un producto, contáctanos y cuéntanos qué tienes en mente para nosotros, queremos que tu experiencia sea única.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-2 text-slate-900">¿Cómo hacer válido un cupón de descuento?</h2>
                <p className="text-slate-700">
                  Si tienes un cupón de descuento y quieres hacerlo válido debes ingresarlo en el apartado que dice "Tengo un código de descuento" al momento de hacer el pago.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-2 text-slate-900">¿Cómo funcionan las GiftCard?</h2>
                <p className="text-slate-700">
                  Al momento de tu compra te haremos llegar por mail tu GiftCard, puede elegir una GiftCard con un valor específico o elegir la mochila que quieres regalar, danos aviso si es un regalo incognito.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-2 text-slate-900">Tengo una GiftCard, ¿cómo puedo activarla?</h2>
                <p className="text-slate-700">
                  Al momento de realizar el pago de tu compra debes seleccionar la opción "Tengo un código", digitar los números de tu GiftCard y se realizará el descuento de inmediato.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
