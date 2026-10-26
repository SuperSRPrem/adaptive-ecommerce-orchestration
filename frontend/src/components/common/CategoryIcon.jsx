import React, { useState } from 'react';
import {
  Laptop,
  Smartphone,
  Watch,
  Refrigerator,
  Package,
  Search,
  SlidersHorizontal,
  IndianRupee,
  Truck,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  BarChart3,
  ShieldCheck,
  Sparkles,
  FlaskConical,
  Database,
  Activity,
  RefreshCw,
  Download,
  Lock,
  Eye,
  EyeOff,
  Info,
  ChevronRight,
  ArrowRight,
  Star,
  Layers,
  Tag,
  HelpCircle,
  XCircle,
  Shuffle,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { normalizeCategoryId } from '../../data/categories.js';

export function CategoryIcon({ category, size = 22, className = '', strokeWidth = 1.8 }) {
  const norm = normalizeCategoryId(category);
  const props = { size, className, strokeWidth, 'aria-hidden': 'true' };

  switch (norm) {
    case 'laptop':
      return <Laptop {...props} />;
    case 'phone':
      return <Smartphone {...props} />;
    case 'watch':
      return <Watch {...props} />;
    case 'refrigerator':
      return <Refrigerator {...props} />;
    default:
      return <Package {...props} />;
  }
}

const COLOR_SWATCH_MAP = {
  black: { bg: '#1e293b', ring: '#475569', label: 'Black' },
  white: { bg: '#f8fafc', ring: '#cbd5e1', label: 'White' },
  silver: { bg: '#cbd5e1', ring: '#94a3b8', label: 'Silver' },
  gray: { bg: '#64748b', ring: '#475569', label: 'Grey' },
  grey: { bg: '#64748b', ring: '#475569', label: 'Grey' },
  blue: { bg: '#2563eb', ring: '#1d4ed8', label: 'Blue' },
  red: { bg: '#dc2626', ring: '#b91c1c', label: 'Red' },
  green: { bg: '#16a34a', ring: '#15803d', label: 'Green' },
  gold: { bg: '#d97706', ring: '#b45309', label: 'Gold' },
  pink: { bg: '#ec4899', ring: '#db2777', label: 'Pink' },
  purple: { bg: '#9333ea', ring: '#7e22ce', label: 'Purple' },
  brown: { bg: '#78350f', ring: '#92400e', label: 'Brown' },
  stainless: { bg: '#94a3b8', ring: '#64748b', label: 'Stainless' },
};

export function resolveColorSwatch(colorText = '') {
  const lower = String(colorText || '').toLowerCase();
  for (const [key, val] of Object.entries(COLOR_SWATCH_MAP)) {
    if (lower.includes(key)) return val;
  }
  return null;
}

const CATEGORY_GRADIENTS = {
  laptop: 'from-blue-50 via-indigo-50/70 to-slate-100 text-blue-700 border-blue-200/60',
  phone: 'from-indigo-50 via-violet-50/70 to-slate-100 text-indigo-700 border-indigo-200/60',
  watch: 'from-emerald-50 via-teal-50/70 to-slate-100 text-emerald-700 border-emerald-200/60',
  refrigerator: 'from-cyan-50 via-sky-50/70 to-slate-100 text-cyan-700 border-cyan-200/60',
};

/**
 * Renders product image if a valid image URL exists in dataset,
 * or a crisp category-icon visual container with brand & color indicators.
 */
export function ProductVisual({
  product,
  category,
  size = 'md',
  className = '',
  showBrandBadge = true,
}) {
  const [imgError, setImgError] = useState(false);
  const resolvedCategory = normalizeCategoryId(
    category || product?.category || 'laptop'
  );
  const imageUrl =
    product?.image_url ||
    product?.imageUrl ||
    (typeof product?.image === 'string' && product.image.startsWith('http')
      ? product.image
      : null);

  const brand = product?.product_brand || product?.brand || '';
  const color = product?.product_color || product?.attributes?.color || '';
  const swatch = resolveColorSwatch(color);
  const gradientClass =
    CATEGORY_GRADIENTS[resolvedCategory] || CATEGORY_GRADIENTS.laptop;

  const iconSize = size === 'lg' ? 42 : size === 'sm' ? 22 : 30;

  if (imageUrl && !imgError) {
    return (
      <div
        className={`relative rounded-xl bg-gradient-to-br ${gradientClass} border flex items-center justify-center overflow-hidden p-2 ${className}`}
      >
        <img
          src={imageUrl}
          alt={product?.product_title || product?.name || 'Product'}
          onError={() => setImgError(true)}
          className="w-full h-full object-contain mix-blend-multiply"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative rounded-xl bg-gradient-to-br ${gradientClass} border flex flex-col items-center justify-center overflow-hidden select-none ${className}`}
    >
      <div className="p-2.5 rounded-2xl bg-white/85 shadow-sm backdrop-blur-xs flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
        <CategoryIcon category={resolvedCategory} size={iconSize} strokeWidth={1.75} />
      </div>

      {showBrandBadge && brand && size !== 'sm' && (
        <span className="mt-1.5 px-2 py-0.5 rounded-full bg-white/90 text-slate-700 font-mono-data text-[10px] font-semibold tracking-wide uppercase max-w-[90%] truncate shadow-2xs">
          {brand}
        </span>
      )}

      {swatch && (
        <span
          title={`Color: ${color}`}
          className="absolute top-2 right-2 w-3 h-3 rounded-full shadow-2xs"
          style={{
            backgroundColor: swatch.bg,
            boxShadow: `0 0 0 1.5px ${swatch.ring}`,
          }}
        />
      )}
    </div>
  );
}

export {
  Laptop,
  Smartphone,
  Watch,
  Refrigerator,
  Package,
  Search,
  SlidersHorizontal,
  IndianRupee,
  Truck,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  BarChart3,
  ShieldCheck,
  Sparkles,
  FlaskConical,
  Database,
  Activity,
  RefreshCw,
  Download,
  Lock,
  Eye,
  EyeOff,
  Info,
  ChevronRight,
  ArrowRight,
  Star,
  Layers,
  Tag,
  HelpCircle,
  XCircle,
  Shuffle,
  RotateCcw,
  ChevronDown,
  ChevronUp,
};

export default CategoryIcon;
