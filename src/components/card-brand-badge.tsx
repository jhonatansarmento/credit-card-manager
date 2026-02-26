import { getBrandInfo } from '@/lib/card-brand';

interface CardBrandBadgeProps {
  name: string;
  /** Tamanho do badge em px — padrão 36 */
  size?: number;
}

export default function CardBrandBadge({
  name,
  size = 36,
}: CardBrandBadgeProps) {
  const brand = getBrandInfo(name);
  const initials = name.slice(0, 2).toUpperCase();
  const iconSize = Math.round(size * 0.55);
  const fontSize = Math.round(size * 0.35);

  return (
    <div
      style={{
        backgroundColor: `#${brand.color}`,
        width: size,
        height: size,
        minWidth: size,
      }}
      className="rounded-lg flex items-center justify-center overflow-hidden shadow-sm"
      title={name}
    >
      {brand.svgPath ? (
        <svg
          role="img"
          viewBox="0 0 24 24"
          width={iconSize}
          height={iconSize}
          fill={brand.iconColor === 'black' ? '#000000' : '#ffffff'}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d={brand.svgPath} />
        </svg>
      ) : (
        <span
          style={{
            fontSize,
            color: brand.iconColor === 'black' ? '#000' : '#fff',
          }}
          className="font-bold leading-none select-none"
        >
          {initials}
        </span>
      )}
    </div>
  );
}
