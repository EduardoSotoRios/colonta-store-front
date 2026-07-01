import Link from "next/link";

export default function GarantiaPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-colonta-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/" className="text-white/80 hover:text-white text-sm mb-2 inline-block">
            ← Volver al inicio
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold">Garantía</h1>
          <p className="text-white/85 mt-2">Atención Colonta</p>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* GARANTÍA */}
          <div className="rounded-2xl ring-1 ring-black/5 p-6 md:p-8 bg-white space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold mb-4 text-slate-900">ITEM - GARANTÍA</h2>
              
              <p className="text-slate-700 mb-4">
                Todos nuestros productos Colonta cuentan con <strong>6 meses de garantía de fabricación</strong> desde que los recibes. Si notas que tu producto tiene algún defecto de fabricación que no sea por un uso inapropiado, ¡no te preocupes! podrás cambiarlo por el mismo producto, uno similar o solicitar la devolución de tu dinero de forma rápida y sencilla.
              </p>

              <p className="text-slate-700 mb-6">
                Queremos que tu experiencia con Colonta siempre sea positiva.
              </p>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-colonta-primary text-white flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <p className="text-slate-700">
                      Escríbenos explicando la situación y adjuntando tu comprobante de compra (lo enviamos a tu mail al momento de concretar la compra).
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-colonta-primary text-white flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <p className="text-slate-700">
                      Nuestro equipo revisará tu caso en un máximo de <strong>5 días hábiles</strong> para confirmar si se trata de un defecto de fabricación.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-colonta-primary text-white flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <p className="text-slate-700">
                      Una vez que validemos el defecto de fabricación, podrás elegir entre cambiar el producto, repararlo o recibir la devolución de tu dinero.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-600">
                  <strong>*</strong> El costo del retiro queda sujeto a evaluación, te informaremos al término de esta.
                </p>
              </div>

              <div className="mt-6 p-4 bg-colonta-primary/10 rounded-xl border border-colonta-primary/20">
                <p className="text-slate-700">
                  <strong>Nuestro compromiso</strong> es darte una respuesta en un máximo de <strong>10 días hábiles</strong> desde que aceptamos tu solicitud. Queremos que tu experiencia sea fácil y sin complicaciones.
                </p>
              </div>
            </div>
          </div>

          {/* CAMBIOS */}
          <div className="rounded-2xl ring-1 ring-black/5 p-6 md:p-8 bg-white space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold mb-4 text-slate-900">CAMBIOS</h2>
              <p className="text-slate-700 mb-2 text-sm text-slate-500">He tenido una falla técnica con mi Colonta</p>
              
              <p className="text-slate-700 mb-4">
                Todos nuestros productos Colonta cuentan con <strong>6 meses de garantía de fabricación</strong> desde que los recibes. Si notas que tu producto tiene algún defecto de fabricación que no sea por un uso inapropiado, ¡no te preocupes! podrás cambiarlo por el mismo producto, uno similar o solicitar la devolución de tu dinero de forma rápida y sencilla.
              </p>

              <p className="text-slate-700 mb-6">
                Queremos que tu experiencia con Colonta siempre sea positiva.
              </p>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-colonta-primary text-white flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <p className="text-slate-700">
                      Escríbenos explicando la situación y adjuntando tu comprobante de compra (lo enviamos a tu mail al momento de concretar la compra).
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-colonta-primary text-white flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <p className="text-slate-700">
                      Nuestro equipo revisará tu caso en un máximo de <strong>5 días hábiles</strong> para confirmar si se trata de un defecto de fabricación.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-colonta-primary text-white flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <p className="text-slate-700">
                      Una vez que validemos el defecto de fabricación, podrás elegir entre cambiar el producto, repararlo o recibir la devolución de tu dinero.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-600">
                  <strong>*</strong> El costo del retiro queda sujeto a evaluación, te informaremos al término de esta.
                </p>
              </div>

              <div className="mt-6 p-4 bg-colonta-primary/10 rounded-xl border border-colonta-primary/20">
                <p className="text-slate-700">
                  <strong>Nuestro compromiso</strong> es darte una respuesta en un máximo de <strong>10 días hábiles</strong> desde que aceptamos tu solicitud. Queremos que tu experiencia sea fácil y sin complicaciones.
                </p>
              </div>
            </div>
          </div>

          {/* DEVOLUCIONES */}
          <div className="rounded-2xl ring-1 ring-black/5 p-6 md:p-8 bg-white space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold mb-4 text-slate-900">DEVOLUCIONES</h2>
              <p className="text-slate-700 mb-2 text-sm text-slate-500">Quiero regresar mi Colonta</p>
              
              <p className="text-slate-700 mb-6">
                Si tu Colonta escogida no cumplió tus expectativas puedes devolverla en un plazo máximo de <strong>10 días</strong> desde que la recibiste, te contamos cuales son los requisitos:
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex gap-3">
                  <span className="text-colonta-primary font-bold">➢</span>
                  <p className="text-slate-700">
                    Queremos que tu experiencia sea excelente, por eso, para gestionar una devolución, el producto debe estar <strong>sin uso, limpio, con etiquetas y embalajes originales, en perfecto estado</strong>.
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="text-colonta-primary font-bold">➢</span>
                  <p className="text-slate-700">
                    Si el producto ha sido usado o probado, solo podremos ofrecer la devolución del dinero si se trata de un <strong>defecto de fabricación confirmado</strong> por nuestro Servicio Técnico.
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="text-colonta-primary font-bold">➢</span>
                  <p className="text-slate-700">
                    Recuerda: después de los <strong>10 días</strong> desde que recibes tu pedido, no podemos hacer devoluciones ni cambios por razones de gustos o preferencias personales.
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="text-colonta-primary font-bold">➢</span>
                  <p className="text-slate-700">
                    Todos los plazos empiezan a contarse desde el momento en que recibes tu producto, así tendrás todo claro y sin sorpresas.
                  </p>
                </div>
              </div>

              <p className="text-slate-700 mb-6">
                Queremos que tu experiencia con Colonta sea siempre positiva. Si necesitas solicitar la devolución de tu dinero, estaremos encantados de ayudarte en el proceso:
              </p>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-colonta-primary text-white flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <p className="text-slate-700">
                      Contáctanos contándonos el motivo de tu devolución. Te pediremos completar un pequeño formulario y adjuntar tu comprobante de compra para poder gestionar tu solicitud.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-colonta-primary text-white flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <p className="text-slate-700">
                      Nuestro equipo revisará tu caso en un máximo de <strong>2 días hábiles</strong> y te confirmaremos, por el mismo medio los pasos para coordinar el retiro o envío del producto de vuelta.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-colonta-primary text-white flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <p className="text-slate-700">
                      Una vez recibido el producto en nuestras instalaciones, verificaremos en un plazo máximo de <strong>2 días</strong> que cumpla con los requisitos de devolución. Luego realizaremos el reembolso a la cuenta que nos indiques.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-2 p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-600">
                  <strong>*</strong> No podemos hacer devoluciones en efectivo de las compras realizadas mediante la página web.
                </p>
                <p className="text-sm text-slate-600">
                  <strong>*</strong> El costo del retiro queda sujeto a evaluación, te informaremos al término de esta.
                </p>
              </div>
            </div>
          </div>

          {/* REPARACIONES */}
          <div className="rounded-2xl ring-1 ring-black/5 p-6 md:p-8 bg-white space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold mb-4 text-slate-900">REPARACIONES</h2>
              <p className="text-slate-700 mb-2 text-sm text-slate-500">Me gustaría reparar mi Colonta</p>
              
              <p className="text-slate-700 mb-6">
                Si tu Colonta ha presentado alguna falla técnica externa, podemos repararla para que siga acompañándote por mucho tiempo más. Queremos que disfrutes de su compañía y que juntos prolonguemos su vida útil, siempre buscando la solución más conveniente para ti.
              </p>

              <p className="text-slate-700 mb-6">
                Contáctanos por WhatsApp contándonos que necesitas reparar, probablemente te pediremos imágenes, te daremos alternativas y costos para que tomes la mejor opción para ti.
              </p>

              <p className="text-slate-700 mb-6">
                Algunas veces reparar tu Colonta no es tan conveniente, y te recomendaremos la opción de reutilización, reciclaje o recuperación (retiramos tu Colonta para darle una segunda vida en otros productos).
              </p>

              <div className="mt-8 p-6 bg-colonta-primary/10 rounded-xl border border-colonta-primary/20">
                <p className="text-slate-700 italic text-center">
                  "Gracias por confiar en Colonta. Cada pieza está hecha con amor y dedicación, queremos que la disfrutes plenamente. Si alguna vez necesitas un cambio, devolución o reparación, recuerda que estamos aquí para acompañarte en cada paso. Tu satisfacción y confianza son parte esencial de nuestra esencia."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

