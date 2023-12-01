import Image from 'next/image';

type AvatarProps = {
  size?: string;
  className?: string;
  alt?: string;
  src?: string | undefined | null;
};

const Avatar = ({ size = 'h-9 w-9', className, alt, src }: AvatarProps) => {
  return (
    <div
      className={`block relative  border border-solid border-neutral-200 rounded-full ${className} ${size}`}
    >
      <Image
        className='rounded-full object-over'
        fill
        src={src ?? '/images/placeholder/male-placeholder.png'}
        alt={alt ?? 'Avatar'}
      />
    </div>
  );
};

export default Avatar;
