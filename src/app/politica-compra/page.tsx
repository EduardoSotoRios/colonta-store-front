import Link from "next/link";

export default function PoliticaCompraPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-colonta-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/" className="text-white/80 hover:text-white text-sm mb-2 inline-block">
            ← Volver al inicio
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold">Política de Compra</h1>
          <p className="text-white/85 mt-2">Términos y Condiciones</p>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="rounded-2xl ring-1 ring-black/5 p-6 md:p-8 bg-white space-y-8">
            {/* Pedidos y confirmación */}
            <div>
              <h2 className="text-2xl font-extrabold mb-4 text-slate-900">Pedidos y confirmación</h2>
              <p className="text-slate-700 mb-4">
                En Colonta queremos que tu experiencia sea simple y tranquila desde el primer momento. Cuando realizas un pedido a través de nuestra tienda online:
              </p>
              <ul className="space-y-2 text-slate-700">
                <li className="flex gap-3">
                  <span className="text-colonta-primary">•</span>
                  <span>Recibirás una confirmación automática por correo electrónico con los detalles de tu compra, incluyendo los productos, cantidades, precio total, plazos de entrega y esta política de compra que aquí enumeramos.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-colonta-primary">•</span>
                  <span>Nuestro plazo de fabricación de productos es un máximo dos semanas, te daremos aviso del plazo estimado por whatsapp y mail dentro de las 24 primeras horas posteriores a tu compra. Cada pedido se procesa en orden de recepción, queremos asegurarnos de preparar y enviar tus productos con cuidado y dedicación.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-colonta-primary">•</span>
                  <span>Te recomendamos revisar con atención la información de tu pedido y dirección de despacho, contacto y plazos para evitar cualquier inconveniente en la entrega.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-colonta-primary">•</span>
                  <span>Si detectas algún error o deseas hacer modificaciones, contáctanos lo antes posible a través de nuestro formulario de contacto (contacta aquí), y con gusto te ayudaremos a corregirlo.</span>
                </li>
              </ul>
            </div>

            {/* Precios y pagos */}
            <div>
              <h2 className="text-2xl font-extrabold mb-4 text-slate-900">Precios y pagos</h2>
              <p className="text-slate-700 mb-4">
                Compromiso de compra transparente y sin sorpresas:
              </p>
              <ul className="space-y-2 text-slate-700">
                <li className="flex gap-3">
                  <span className="text-colonta-primary">•</span>
                  <span>Todos los precios de nuestros productos Colonta incluyen impuestos vigentes, y se muestran en pesos chilenos (CLP) en nuestra tienda online.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-colonta-primary">•</span>
                  <span>Los métodos de pago disponibles son tarjeta de crédito/débito (Onepay). Cada transacción se realiza a través de plataformas confiables para proteger tu información.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-colonta-primary">•</span>
                  <span>El cobro del producto se realiza en el momento de confirmar tu pedido, asegurando que tu compra quede reservada.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-colonta-primary">•</span>
                  <span>En caso de descuentos, promociones o códigos de cupón, el precio final refleja la oferta vigente al momento de la compra.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-colonta-primary">•</span>
                  <span>Si surge algún error en el precio publicado, nos comunicaremos contigo de inmediato antes de procesar tu pedido para explicarte la situación y ofrecer la mejor solución posible.</span>
                </li>
              </ul>
            </div>

            {/* Envíos y tiempos de entrega */}
            <div>
              <h2 className="text-2xl font-extrabold mb-4 text-slate-900">Envíos y tiempos de entrega</h2>
              <p className="text-slate-700 mb-4">
                En Colonta cuidamos cada detalle para que tus productos lleguen a tus manos de manera segura y puntual:
              </p>
              <ul className="space-y-2 text-slate-700">
                <li className="flex gap-3">
                  <span className="text-colonta-primary">•</span>
                  <span>Todos los pedidos son procesados con cariño y atención antes de ser enviados.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-colonta-primary">•</span>
                  <span>El tiempo estimado de entrega dependerá de tu ubicación y será informado al momento de tu compra junto con el valor de este, te sugerimos revisar el cuadro informativo más abajo para tener un valor y plazo estimado de entrega.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-colonta-primary">•</span>
                  <span>Los envíos se realizan a través de empresas transportistas confiables, te damos la opción de elegir en la R.M la empresa que quieres que te despache, hacemos lo posible por asegurar que tu pedido llegue en las mejores condiciones.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-colonta-primary">•</span>
                  <span>Una vez despachado tu pedido, recibirás un correo de seguimiento con los datos del envío para que puedas monitorear su progreso.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-colonta-primary">•</span>
                  <span>No nos es posible asumir responsabilidades por retrasos ocasionados por circunstancias externas al envío (clima, transportistas, días festivos), pero siempre hacemos nuestro mejor esfuerzo para mantenerte informado y apoyarte si surge algún inconveniente.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-colonta-primary">•</span>
                  <span>Si tu pedido llegara dañado o incompleto, por favor contáctanos de inmediato; nuestro compromiso es encontrar una solución rápida y satisfactoria para ti.</span>
                </li>
              </ul>
            </div>

            {/* Responsabilidades */}
            <div>
              <h2 className="text-2xl font-extrabold mb-4 text-slate-900">Responsabilidades de Colonta y de nuestros clientes</h2>
              <p className="text-slate-700 mb-4">
                En Colonta creemos en la confianza mutua. Por eso, es importante que tanto nosotros como tú tengamos claras nuestras responsabilidades:
              </p>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold mb-2 text-slate-900">Responsabilidades de Colonta</h3>
                  <ul className="space-y-2 text-slate-700">
                    <li className="flex gap-3">
                      <span className="text-colonta-primary">•</span>
                      <span>Cumplir con lo ofrecido en la tienda online, respetando precios, promociones, materiales y características de cada producto.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-colonta-primary">•</span>
                      <span>Preparar y despachar los pedidos con cuidado y dedicación que representan a nuestra marca.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-colonta-primary">•</span>
                      <span>Informar de manera clara y oportuna los tiempos de entrega, políticas de cambio y devoluciones.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-colonta-primary">•</span>
                      <span>Responder en caso de que un producto presente fallas de fabricación o errores en el despacho, buscando siempre la solución más justa para ti y cumpliendo con lo estipulado en la Ley chilena N° 19.496 protección de los derechos de los consumidores.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-colonta-primary">•</span>
                      <span>Proteger tus datos personales y utilizarlos únicamente para fines relacionados con tu compra, despacho y experiencia en Colonta. No compartimos información confidencial de tus compras ni de tu cuenta privada con ninguna entidad ni persona natural.</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-bold mb-2 text-slate-900">Responsabilidades de nuestros clientes</h3>
                  <ul className="space-y-2 text-slate-700">
                    <li className="flex gap-3">
                      <span className="text-colonta-primary">•</span>
                      <span>Entregar información veraz y completa al momento de la compra, especialmente en lo referente a datos de contacto y dirección de entrega.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-colonta-primary">•</span>
                      <span>Revisar los detalles de su pedido al recibir la confirmación, para asegurarse de que la información sea correcta.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-colonta-primary">•</span>
                      <span>Cuidar el producto recibido y, en caso de cambios o devoluciones, enviarlo en las mismas condiciones en que fue entregado.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-colonta-primary">•</span>
                      <span>Respetar los plazos establecidos para solicitar cambios, devoluciones o ejercer el derecho a retracto.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Protección de datos */}
            <div>
              <h2 className="text-2xl font-extrabold mb-4 text-slate-900">Protección de datos y privacidad</h2>
              <p className="text-slate-700 mb-4">
                En Colonta cuidamos de tu confianza tanto como de nuestros productos. Sabemos que tu información personal es valiosa y por eso nos comprometemos a protegerla con responsabilidad y respeto.
              </p>
              <ul className="space-y-2 text-slate-700">
                <li className="flex gap-3">
                  <span className="text-colonta-primary">•</span>
                  <span>Los datos que nos entregues al momento de comprar (como tu nombre, dirección, correo electrónico o teléfono) serán utilizados únicamente para gestionar tu pedido, despachar correctamente y mantenerte informado sobre tu compra.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-colonta-primary">•</span>
                  <span>No compartiremos tu información con terceros, salvo con las empresas de transporte que realizan la entrega y únicamente para cumplir con el envío.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-colonta-primary">•</span>
                  <span>Podrás solicitar en cualquier momento la modificación o eliminación de tus datos personales de nuestros registros escribiéndonos a nuestro correo de contacto.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-colonta-primary">•</span>
                  <span>Si decides suscribirte a nuestro boletín o lista de novedades, recibirás información sobre lanzamientos, promociones y contenido especial de Colonta. Siempre tendrás la opción de darte de baja fácilmente si así lo deseas.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-colonta-primary">•</span>
                  <span>Nos comprometemos a resguardar tu información utilizando plataformas de pago y sistemas seguros que protegen tus transacciones.</span>
                </li>
              </ul>
            </div>

            {/* Cierre */}
            <div className="mt-8 p-6 bg-colonta-primary/10 rounded-xl border border-colonta-primary/20">
              <p className="text-slate-700">
                En Colonta cada producto es más que un objeto, es una pieza que acompaña tu camino, hecha con dedicación, responsabilidad medioambiental y respeto. Nuestros Términos y Condiciones buscan simplemente dar claridad y confianza para que tu experiencia de compra sea transparente, segura y alineada con los valores que nos inspiran.
              </p>
              <p className="text-slate-700 mt-4">
                Al elegir Colonta, no solo recibes un producto, sino también el cariño y la intención con que ha sido creado. Gracias por confiar en nosotras y ser parte de esta comunidad que valora lo auténtico, lo consciente y lo hecho con el corazón.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
