import React from 'react';

export interface ApplicationIcon {
  /** Type of icon */
  type?: 'img' | 'icon';
  /** URL to the image used for the icon */
  src?: string;
  /** CSS class or variant key to apply to the icon element */
  class?: string;
  /** Contents of the icon element (e.g. ligature name) */
  content?: string;
  /** Background color */
  background?: string;
}

const CLASS_MAP: Record<string, string> = {
  rounded: 'material-symbols-rounded',
  outlined: 'material-symbols-outlined',
  sharp: 'material-symbols-sharp',
};

interface IconProps {
  icon?: ApplicationIcon;
  /** Additional CSS classes for styling (size, color, etc) - the material-symbols font class is automatically added */
  className?: string;
  children?: React.ReactNode;
}

export const Icon: React.FC<IconProps> = ({
  icon,
  className = '',
  children,
}) => {
  // Determine the Material Symbols variant (rounded by default)
  const variantClass = CLASS_MAP[icon?.class ?? 'rounded'] || 'material-symbols-rounded';

  // Combine the variant class with any additional styling classes
  const iconClasses = `${variantClass} ${className}`.trim();

  return (
    <div className="flex h-[1.25em] max-h-[1.25em] w-[1.25em] max-w-[1.25em] items-center justify-center overflow-hidden">
      {!icon || icon.type !== 'img' ? (
        <i className={iconClasses} style={{ fontSize: '1em' }}>
          {icon?.content}
          {children}
        </i>
      ) : icon.type === 'img' && icon.src ? (
        <img className="h-[1em] w-[1em]" src={icon.src} alt="" />
      ) : null}
    </div>
  );
};
