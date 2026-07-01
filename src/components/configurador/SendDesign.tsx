'use client';

import { useState } from 'react';
import Image from 'next/image';
import { downloadCanvas } from '@/lib/configurador/canvasUtils';

interface SendDesignProps {
  productName: string;
  designDataURL: string;
  onSent: () => void;
  onBack: () => void;
}

export default function SendDesign({ productName, designDataURL, onSent, onBack }: SendDesignProps) {
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [comment, setComment] = useState('');
  const [toast, setToast]     = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  function showToast(msg: string, duration = 2000) {
    setToast(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), duration);
  }

  function handleSend() {
    if (!name.trim()) { showToast('⚠️ Por favor ingresa tu nombre'); return; }
    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      showToast('⚠️ Ingresa un correo válido'); return;
    }

    downloadCanvas(designDataURL, productName);

    const subject = encodeURIComponent(`Diseño personalizado - ${productName} - ${name}`);
    const body = encodeURIComponent(
      `Hola equipo Colonta,\n\nSe ha recibido un nuevo diseño personalizado:\n\n` +
      `👤 Cliente: ${name}\n📧 Correo: ${email}\n🎒 Producto: ${productName}\n\n` +
      `💬 Comentario:\n${comment || '(Sin comentarios adicionales)'}\n\n` +
      `📎 IMPORTANTE: Adjunte la imagen del diseño que se descargó automáticamente en su computador.\n\n` +
      `Saludos,\n${name}`
    );

    setTimeout(() => {
      window.open(`mailto:ventas@colonta.cl?subject=${subject}&body=${body}`, '_blank');
    }, 400);

    showToast('✅ Imagen descargada — adjúntala al correo que se abrirá', 4000);
    setTimeout(() => onSent(), 2000);
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-5">
        <h2 className="text-2xl font-bold text-gray-800">Envía tu diseño 🚀</h2>
        <p className="text-gray-500 text-sm">
          Tu diseño se descargará como imagen. Te abriremos el correo para que lo adjuntes y nos lo envíes.
        </p>

        {/* Preview */}
        <div className="bg-gray-50 rounded-xl p-3 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={designDataURL} alt="Vista previa del diseño" className="max-h-40 object-contain rounded-lg" />
        </div>

        {/* Info box */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          📎 <strong>¿Cómo funciona?</strong> Al hacer clic en &quot;Enviar&quot;, tu diseño se descargará como imagen PNG.
          Luego se abrirá tu correo con el mensaje listo — solo necesitas adjuntar esa imagen.
        </div>

        {/* Form */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tu nombre</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nombre completo"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B2D8E] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B2D8E] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Producto elegido</label>
            <input
              type="text"
              value={productName}
              readOnly
              className="w-full border border-gray-100 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Comentarios y detalles adicionales</label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Cuéntanos más sobre tu diseño: medidas, cantidad, colores, algún detalle especial..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B2D8E] focus:border-transparent resize-none"
            />
          </div>
        </div>

        <button
          onClick={handleSend}
          className="w-full py-3 bg-[#5B2D8E] hover:bg-[#4a2275] text-white font-semibold rounded-2xl transition-colors text-sm"
        >
          📥 Descargar diseño y abrir correo
        </button>
        <p className="text-xs text-gray-400 text-center">
          Se descargará la imagen y se abrirá tu cliente de correo con el mensaje listo para enviar.
        </p>

        <button onClick={onBack} className="w-full text-sm text-gray-400 hover:text-gray-600 transition-colors pt-1">
          ← Volver al diseño
        </button>
      </div>

      {toastVisible && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-full shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
