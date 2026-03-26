import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';

interface ExpandableTextProps {
  text: string;
  maxLines?: number;
  className?: string;
}

export const ExpandableText: React.FC<ExpandableTextProps> = ({ 
  text, 
  maxLines = 2,
  className 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const element = textRef.current;
    if (element) {
      // Check if text is actually truncated
      setIsTruncated(element.scrollHeight > element.clientHeight);
    }
  }, [text]);

  return (
    <div className="relative">
      <p
        ref={textRef}
        className={cn(
          "text-sm text-text-secondary/70 leading-relaxed font-medium transition-all duration-300",
          !isExpanded && `line-clamp-${maxLines}`,
          className
        )}
      >
        {text}
      </p>
      
      {isTruncated && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="text-accent text-xs font-bold hover:text-accent/80 transition-colors mt-1 flex items-center gap-1"
        >
          {isExpanded ? (
            <>
              <span>Show less</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="transition-transform">
                <path d="M6 4L10 8H2L6 4z" fill="currentColor"/>
              </svg>
            </>
          ) : (
            <>
              <span>Read more</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="transition-transform">
                <path d="M6 8L2 4h8L6 8z" fill="currentColor"/>
              </svg>
            </>
          )}
        </button>
      )}
    </div>
  );
};
