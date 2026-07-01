import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Images } from 'lucide-react';
import { Car as CarType } from '../lib/supabase';

interface Car3DModalProps {
  car: CarType;
  onClose: () => void;
}

const defaultImage = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&auto=format&fit=crop&q=90';

export default function Car3DModal({ car, onClose }: Car3DModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [animating, setAnimating] = useState(false);

  const images = car.images?.length > 0 ? car.images : [car.image_url || defaultImage];

  const navigate = useCallback((dir: 'left' | 'right') => {
    if (animating || images.length <= 1) return;
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) =>
        dir === 'right'
          ? (prev + 1) % images.length
          : (prev - 1 + images.length) % images.length
      );
      setAnimating(false);
    }, 220);
  }, [animating, images.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') navigate('right');
      if (e.key === 'ArrowLeft') navigate('left');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate, onClose]);

  const transformStyle = animating
    ? {
        transform: `perspective(1200px) rotateY(${direction === 'right' ? '-8deg' : '8deg'}) scale(0.95)`,
        opacity: 0.3,
        transition: 'transform 0.22s ease, opacity 0.22s ease',
      }
    : {
        transform: 'perspective(1200px) rotateY(0deg) scale(1)',
        opacity: 1,
        transition: 'transform 0.22s ease, opacity 0.22s ease',
      };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-4xl mx-4 bg-gray-950 rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <Images className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-xl font-bold text-white">{car.brand} {car.name}</h2>
              <p className="text-sm text-gray-400">{car.year} • {images.length} photo{images.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-800 transition-colors">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Image Viewer */}
        <div className="relative bg-black" style={{ aspectRatio: '16/9' }}>
          <div className="w-full h-full flex items-center justify-center">
            <img
              key={currentIndex}
              src={images[currentIndex]}
              alt={`${car.brand} ${car.name} photo ${currentIndex + 1}`}
              className="w-full h-full object-contain"
              style={transformStyle}
            />
          </div>

          {images.length > 1 && (
            <>
              <button
                onClick={() => navigate('left')}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/80 border border-gray-700 text-white transition-all hover:scale-110"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => navigate('right')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/80 border border-gray-700 text-white transition-all hover:scale-110"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`rounded-full transition-all ${
                      i === currentIndex ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="flex gap-2 p-4 overflow-x-auto bg-gray-950 border-t border-gray-800">
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                  i === currentIndex ? 'border-amber-500 scale-105' : 'border-gray-700 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
