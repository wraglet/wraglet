import Image from 'next/image';

type AvatarProps = {
  gender?: string;
  size?: string;
  className?: string;
  alt?: string;
  src?: string | undefined | null;
};

const Avatar = ({
  gender,
  size = 'h-9 w-9',
  className,
  alt,
  src
}: AvatarProps) => {
  return (
    <div
      className={`block relative  border border-solid border-neutral-200 rounded-full ${className} ${size}`}
    >
      <Image
        className='rounded-full object-over'
        fill
        sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
        src={
          src ||
          (gender === 'Male'
            ? '/images/placeholder/male-placeholder.png'
            : '/images/placeholder/female-placeholder.png')
        }
        alt={alt ?? 'Avatar'}
      />
    </div>
  );
};

export default Avatar;
