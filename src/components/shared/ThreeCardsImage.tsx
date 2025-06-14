import * as React from 'react';
import { SVGProps } from 'react';
const ThreeCardsImage = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width={70}
    height={52}
    fill='none'
    {...props}
  >
    <path
      fill='#fff'
      stroke='#0EA5E9'
      strokeWidth={2}
      d='m6.052 8.869 11.161-1.86V40.86l-4.911 1.034A6 6 0 0 1 5.17 37.14L1.143 15.905a6 6 0 0 1 4.909-7.036ZM63.948 8.869l-11.161-1.86V40.86l4.911 1.034a6 6 0 0 0 7.131-4.754l4.028-21.236a6 6 0 0 0-4.909-7.036Z'
    />
    <g filter='url(#a)'>
      <rect
        width={37.869}
        height={44.754}
        x={16.065}
        y={0.123}
        fill='#fff'
        rx={6}
      />
      <rect
        width={35.869}
        height={42.754}
        x={17.065}
        y={1.123}
        stroke='#0EA5E9'
        strokeWidth={2}
        rx={5}
      />
    </g>
    <path
      fill='#EDFAFA'
      stroke='#0EA5E9'
      strokeWidth={2}
      d='M47.934 43.877H22.065a5 5 0 0 1-5-5v-3.46l12.407-13.149 9.51 10.944a2 2 0 0 0 3.028-.01l5.236-6.102 5.688 6.12v5.657a5 5 0 0 1-5 5Z'
    />
    <circle
      cx={39.59}
      cy={14.467}
      r={4.164}
      fill='#EDFAFA'
      stroke='#0EA5E9'
      strokeWidth={2}
    />
    <defs>
      <filter
        id='a'
        width={43.869}
        height={51.754}
        x={13.065}
        y={0.123}
        colorInterpolationFilters='sRGB'
        filterUnits='userSpaceOnUse'
      >
        <feFlood floodOpacity={0} result='BackgroundImageFix' />
        <feColorMatrix
          in='SourceAlpha'
          result='hardAlpha'
          values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
        />
        <feOffset dy={2} />
        <feGaussianBlur stdDeviation={1} />
        <feComposite in2='hardAlpha' operator='out' />
        <feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0' />
        <feBlend
          in2='BackgroundImageFix'
          result='effect1_dropShadow_903_11352'
        />
        <feColorMatrix
          in='SourceAlpha'
          result='hardAlpha'
          values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
        />
        <feOffset dy={4} />
        <feGaussianBlur stdDeviation={1.5} />
        <feComposite in2='hardAlpha' operator='out' />
        <feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.07 0' />
        <feBlend
          in2='effect1_dropShadow_903_11352'
          result='effect2_dropShadow_903_11352'
        />
        <feBlend
          in='SourceGraphic'
          in2='effect2_dropShadow_903_11352'
          result='shape'
        />
      </filter>
    </defs>
  </svg>
);
export default ThreeCardsImage;
