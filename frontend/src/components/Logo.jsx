const Logo = ({ size = "text-2xl", showText = true }) => {
  return (
    <div className="flex items-center gap-2">
      <svg 
        width="32" 
        height="32" 
        viewBox="0 0 32 32" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={`${size === 'text-2xl' ? 'w-8 h-8' : size === 'text-3xl' ? 'w-10 h-10' : 'w-12 h-12'}`}
      >
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#00D4FF" />
          </linearGradient>
        </defs>
        
        {/* Main Z shape */}
        <path 
          d="M6 8 L6 12 L14 12 L14 16 L10 16 L10 20 L14 20 L14 24 L18 24 L18 20 L22 20 L22 16 L18 16 L18 12 L26 12 L26 8 Z" 
          fill="url(#logoGradient)"
        />
        
        {/* Glow effect */}
        <path 
          d="M6 8 L6 12 L14 12 L14 16 L10 16 L10 20 L14 20 L14 24 L18 24 L18 20 L22 20 L22 16 L18 16 L18 12 L26 12 L26 8 Z" 
          fill="url(#logoGradient)"
          opacity="0.3"
          filter="blur(4px)"
        />
      </svg>
      
      {showText && (
        <span className={`${size} font-bold glow-text`}>
          Zyro
        </span>
      )}
    </div>
  )
}

export default Logo
