import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Ruler, Scale } from 'lucide-react';

export default function SizeCalculator({ isOpen, onClose }) {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [suggestedSize, setSuggestedSize] = useState(null);

  const calculateSize = (e) => {
    e.preventDefault();
    if (!height || !weight) return;

    const h = parseFloat(height);
    const w = parseFloat(weight);

    // Simple rough heuristic for fashion sizing based on height (cm) and weight (kg)
    let size = 'M';
    if (h < 160 && w < 55) {
      size = 'S';
    } else if (h < 170 && w < 65) {
      size = 'M';
    } else {
      size = 'L';
    }

    setSuggestedSize(size);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-sm bg-surface rounded-2xl shadow-2xl p-8 z-10"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-outline hover:text-on-surface transition-colors"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-8">
              <h2 className="font-headline text-2xl mb-2 text-on-surface">Size Advisor</h2>
              <p className="text-xs text-outline font-label uppercase tracking-widest">Find your perfect fit</p>
            </div>

            <form onSubmit={calculateSize} className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-on-surface mb-2">
                  <Ruler size={14} /> Height (cm)
                </label>
                <input 
                  type="number" 
                  min="0"
                  value={height} 
                  onChange={(e) => setHeight(e.target.value)} 
                  placeholder="e.g. 165"
                  className="w-full bg-surface-container/30 border border-outline-variant/30 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-on-surface transition-colors"
                  required 
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-on-surface mb-2">
                  <Scale size={14} /> Weight (kg)
                </label>
                <input 
                  type="number" 
                  min="0"
                  value={weight} 
                  onChange={(e) => setWeight(e.target.value)} 
                  placeholder="e.g. 55"
                  className="w-full bg-surface-container/30 border border-outline-variant/30 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-on-surface transition-colors"
                  required 
                />
              </div>

              {!suggestedSize && (
                <button type="submit" className="w-full py-4 bg-on-surface text-surface rounded-full text-xs font-bold uppercase tracking-widest hover:bg-secondary transition-colors">
                  Calculate Size
                </button>
              )}

              {suggestedSize && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-secondary/10 border border-secondary/20 p-6 rounded-xl text-center mt-4"
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-2">Recommended Size</p>
                  <p className="font-headline text-4xl text-on-surface">{suggestedSize}</p>
                </motion.div>
              )}
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
