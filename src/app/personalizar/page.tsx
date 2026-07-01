import type { Metadata } from 'next';
import ConfiguradorClient from '@/components/configurador/ConfiguradorClient';

export const metadata: Metadata = {
  title: 'Colonta | Personaliza tu producto',
  description: 'Diseña tu mochila o accesorio Colonta con nuestro configurador de colores y telas personalizadas.',
};

export default function PersonalizarPage() {
  return <ConfiguradorClient />;
}
