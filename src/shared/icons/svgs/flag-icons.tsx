import type { SVGProps } from "react";

export function FlagVnIcon({
  width = 18,
  height = 13,
  className,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 30 20"
      width={width}
      height={height}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect width="30" height="20" fill="#da251d" rx="2.5" />
      <polygon
        fill="#ffff00"
        points="15,4 16.54,8.75 21.54,8.75 17.5,11.69 19.04,16.44 15,13.5 10.96,16.44 12.5,11.69 8.46,8.75 13.46,8.75"
      />
    </svg>
  );
}

export function FlagUsIcon({
  width = 18,
  height = 13,
  className,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 30 20"
      width={width}
      height={height}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <clipPath id="us-flag-round">
        <rect width="30" height="20" rx="2.5" />
      </clipPath>
      <g clipPath="url(#us-flag-round)">
        <rect width="30" height="20" fill="#b22234" />
        <path
          d="M0,1.54h30M0,4.62h30M0,7.69h30M0,10.77h30M0,13.85h30M0,16.92h30"
          stroke="#ffffff"
          strokeWidth="1.54"
        />
        <rect width="13" height="10.77" fill="#3c3b6e" />
        <circle cx="2.5" cy="2.2" r="0.65" fill="#ffffff" />
        <circle cx="6.5" cy="2.2" r="0.65" fill="#ffffff" />
        <circle cx="10.5" cy="2.2" r="0.65" fill="#ffffff" />
        <circle cx="4.5" cy="4.2" r="0.65" fill="#ffffff" />
        <circle cx="8.5" cy="4.2" r="0.65" fill="#ffffff" />
        <circle cx="2.5" cy="6.2" r="0.65" fill="#ffffff" />
        <circle cx="6.5" cy="6.2" r="0.65" fill="#ffffff" />
        <circle cx="10.5" cy="6.2" r="0.65" fill="#ffffff" />
        <circle cx="4.5" cy="8.2" r="0.65" fill="#ffffff" />
        <circle cx="8.5" cy="8.2" r="0.65" fill="#ffffff" />
      </g>
    </svg>
  );
}
