export default function MarqueeTrack({
  items,
  renderItem,
  speed = '20s',
  gap = '64px',
  masked = true,
  className = '',
}) {
  // Duplicate items for seamless infinite loop
  const doubled = [...items, ...items];

  return (
    <div
      className={`marquee-outer ${className}`}
      style={{
        overflow: 'hidden',
        ...(masked
          ? {
              maskImage:
                'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
              WebkitMaskImage:
                'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
            }
          : {}),
      }}
    >
      <div
        className="marquee-track"
        style={{
          display: 'flex',
          gap,
          alignItems: 'center',
          animation: `marquee ${speed} linear infinite`,
          width: 'max-content',
        }}
      >
        {doubled.map((item, index) => renderItem(item, index))}
      </div>
    </div>
  );
}
