'use client';

import { useState } from 'react';
import StepsBar       from './StepsBar';
import ProductSelector from './ProductSelector';
import CanvasDesigner  from './CanvasDesigner';
import SendDesign      from './SendDesign';
import SuccessScreen   from './SuccessScreen';
import { type ProductId } from '@/lib/configurador/products';

type Step = 1 | 2 | 3 | 4;

export default function ConfiguradorClient() {
  const [step, setStep]                 = useState<Step>(1);
  const [productId, setProductId]       = useState<ProductId | null>(null);
  const [productName, setProductName]   = useState('');
  const [designDataURL, setDesignDataURL] = useState('');

  function handleProductSelect(id: ProductId, name: string) {
    setProductId(id);
    setProductName(name);
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleContinueFromCanvas(dataURL: string) {
    setDesignDataURL(dataURL);
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleSent() {
    setStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleRestart() {
    setProductId(null);
    setProductName('');
    setDesignDataURL('');
    setStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="min-h-screen bg-[#F7F6FB]">
      <StepsBar currentStep={step} />

      {step === 1 && (
        <ProductSelector onSelect={handleProductSelect} />
      )}

      {step === 2 && productId && (
        <div className="pb-20 md:pb-8 pt-4">
          <CanvasDesigner
            product={productId}
            productName={productName}
            onContinue={handleContinueFromCanvas}
            onBack={() => setStep(1)}
          />
        </div>
      )}

      {step === 3 && (
        <SendDesign
          productName={productName}
          designDataURL={designDataURL}
          onSent={handleSent}
          onBack={() => setStep(2)}
        />
      )}

      {step === 4 && (
        <SuccessScreen onRestart={handleRestart} />
      )}
    </div>
  );
}
