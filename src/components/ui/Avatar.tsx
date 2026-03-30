interface AvatarProps {
  src?: string | null
  name: string
  size?: number
  className?: string
}

export function Avatar({ src, name, size = 32, className = '' }: AvatarProps) {
  const initials = name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        className={`rounded-full object-cover flex-shrink-0 ${className}`}
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <span
      className={`inline-flex flex-shrink-0 items-center justify-center rounded-full bg-accent font-bold text-bg-primary ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      aria-label={name}
    >
      {initials}
    </span>
  )
}
