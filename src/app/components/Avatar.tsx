import Image from 'next/image';

type AvatarProps = {
  className?: string;
  alt?: string;
  src?: string | undefined | null;
};

const Avatar = ({ className, alt, src }: AvatarProps) => {
  return (
    <div
      className={`block relative h-9 w-9 border border-solid border-neutral-200 rounded-full ${className}`}
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
