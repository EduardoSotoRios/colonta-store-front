import Image from "next/image";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer id="contacto" className="bg-colonta-primary text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="flex flex-col gap-2">
            <div  className="relative w-20 h-7">
              <Image
                src="/logo.png"
                alt="Colonta Logo"
                fill
                className="object-cover"
              />
            </div>
            <p className="text-sm text-white/80">
              Mochilas con propósito, hechas para acompañarte en cada paso.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Compra segura</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white">
                  ¿Cómo comprar?
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Despacho
                </a>
              </li>
              <li>
                <a href="/garantia" className="hover:text-white">
                  Garantía
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Métodos de pago
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Transparencia</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white">
                  Privacidad
                </a>
              </li>
              <li>
                <a href="/politica-compra" className="hover:text-white">
                  Términos y condiciones
                </a>
              </li>
              <li>
                <a href="preguntas-frecuentes" className="hover:text-white">
                  Cambios y devoluciones
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Entérate primero</h4>
            <form className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="Tu e-mail"
                className="flex-1 rounded-xl border-white/20 bg-white/10 text-white placeholder:text-white/70 focus:ring-white focus:border-white px-4 py-2.5"
              />
              <button className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-semibold text-colonta-primary bg-white hover:opacity-90 text-nowrap">
                Me anoto
              </button>
            </form>
          </div>
        </div>
        <div className="flex justify-center gap-4 mt-4 text-white/80">
          <a
            href="https://www.instagram.com/colonta/?hl=es"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="hover:text-white"
          >
            Instagram
          </a>
          <a
            href="https://www.facebook.com/Colonta/?locale=es_LA"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="hover:text-white"
          >
            Facebook
          </a>
          <a href="#" aria-label="TikTok" className="hover:text-white">
            TikTok
          </a>
        </div>
        <div className="mt-5 pt-6 border-t border-white/20 text-xs text-white/80 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <p>
            © <span id="year"></span> Colonta. Todos los derechos reservados.
          </p>
          <p>Envíos a todo Chile • Webpay disponible</p>
        </div>
      </div>
    </footer>
  );
}
