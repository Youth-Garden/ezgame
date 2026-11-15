import { memo } from "react";
import { ChessPieceColor, ChessPieceType } from "../types";

interface ChessPieceProps {
  type: ChessPieceType;
  color: ChessPieceColor;
  className?: string;
}

export const ChessPieceView = memo(function ChessPieceView({
  type,
  color,
  className = "w-full h-full",
}: ChessPieceProps) {
  const isWhite = color === ChessPieceColor.WHITE;
  const fillColor = isWhite ? "#FFFFFF" : "#1C1917";
  const strokeColor = isWhite ? "#262626" : "#FAFAFA";
  const accentColor = isWhite ? "#E5E5E5" : "#44403C";

  switch (type) {
    case ChessPieceType.PAWN:
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <path
            d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );

    case ChessPieceType.KNIGHT:
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <g
            fill="none"
            fillRule="evenodd"
            stroke={strokeColor}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18"
              fill={fillColor}
            />
            <path
              d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,7.4 17.05,4.44 22.5,10.5 D"
              fill={fillColor}
            />
            <circle cx="15" cy="14" r="1.5" fill={strokeColor} />
            <path d="M 9.5 25.5 A 0.5 0.5 0 1 1 8.5,25.5 A 0.5 0.5 0 1 1 9.5 25.5 z" fill={strokeColor} />
          </g>
        </svg>
      );

    case ChessPieceType.BISHOP:
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <g
            fill="none"
            fillRule="evenodd"
            stroke={strokeColor}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <g fill={fillColor} strokeLinecap="butt">
              <path d="M 9,36 C 12.39,35.03 19.11,36.43 22.5,34 C 25.89,36.43 32.61,35.03 36,36 C 36,36 37.65,36.54 39,38 C 38.32,38.97 37.35,38.99 36,38.5 C 32.61,37.53 25.89,38.96 22.5,37.5 C 19.11,38.96 12.39,37.53 9,38.5 C 7.646,38.99 6.677,38.97 6,38 C 7.354,36.54 9,36 9,36 z" />
              <path d="M 15,32 C 17.5,34.5 27.5,34.5 30,32 C 30.5,30.5 30,30 30,30 C 30,27.5 27.5,26 27.5,26 C 33,24.5 33.5,14.5 22.5,10.5 C 11.5,14.5 12,24.5 17.5,26 C 17.5,26 15,27.5 15,30 C 15,30 14.5,30.5 15,32 z" />
              <circle cx="22.5" cy="8.5" r="2.5" />
            </g>
            <path d="M 17.5,26 L 27.5,26 M 15,30 L 30,30 M 22.5,15.5 L 22.5,20.5 M 20,18 L 25,18" />
          </g>
        </svg>
      );

    case ChessPieceType.ROOK:
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <g
            fill={fillColor}
            fillRule="evenodd"
            stroke={strokeColor}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              d="M 9,39 L 36,39 L 36,36 L 9,36 L 9,39 z"
              style={{ strokeLinecap: "butt" }}
            />
            <path
              d="M 12,36 L 12,32 L 33,32 L 33,36 L 12,36 z"
              style={{ strokeLinecap: "butt" }}
            />
            <path
              d="M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14"
              style={{ strokeLinecap: "butt" }}
            />
            <path d="M 34,14 L 31,17 L 14,17 L 11,14" />
            <path
              d="M 14,17 L 14,29.5 L 31,29.5 L 31,17"
              strokeLinejoin="miter"
            />
            <path
              d="M 14,29.5 L 11,32 L 34,32 L 31,29.5"
              strokeLinejoin="miter"
            />
            <path
              d="M 14,17 L 31,17 M 14,29.5 L 31,29.5"
              stroke={accentColor}
            />
          </g>
        </svg>
      );

    case ChessPieceType.QUEEN:
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <g
            fill={fillColor}
            fillRule="evenodd"
            stroke={strokeColor}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38.5,13.5 L 31,25 L 22.5,10 L 14,25 L 6.5,13.5 L 9,26 z" />
            <path d="M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 11,36 11,36 C 11.5,37 13.5,36.5 15,36.5 C 16.5,36.5 17.5,37 18.5,37 C 19.5,37 20,36.5 22.5,36.5 C 25,36.5 25.5,37 26.5,37 C 27.5,37 28.5,36.5 30,36.5 C 31.5,36.5 33.5,37 34,36 C 34,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26" />
            <path
              d="M 11.5,30 C 15,29 30,29 33.5,30 M 12,33.5 C 18,32.5 27,32.5 33,33.5"
              stroke={strokeColor}
            />
            <circle cx="6" cy="12" r="2" />
            <circle cx="14" cy="9" r="2" />
            <circle cx="22.5" cy="8" r="2" />
            <circle cx="31" cy="9" r="2" />
            <circle cx="39" cy="12" r="2" />
          </g>
        </svg>
      );

    case ChessPieceType.KING:
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <g
            fill="none"
            fillRule="evenodd"
            stroke={strokeColor}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              d="M 22.5,11.63 L 22.5,6"
              style={{ strokeLinejoin: "miter" }}
            />
            <path
              d="M 20,8 L 25,8"
              style={{ strokeLinejoin: "miter" }}
            />
            <path
              d="M 22.5,25 C 22.5,25 27,17.5 25.5,14.5 C 24,11.5 21,11.5 19.5,14.5 C 18,17.5 22.5,25 22.5,25"
              fill={fillColor}
            />
            <path
              d="M 11.5,37 C 17,40.5 28,40.5 33.5,37 C 36.5,31 37.5,22 37.5,22 C 34.5,25.5 31,23 31,23 C 28,26.5 25.5,24 25.5,24 C 23.5,26 21.5,26 19.5,24 C 19.5,24 17,26.5 14,23 C 14,23 10.5,25.5 7.5,22 C 7.5,22 8.5,31 11.5,37 z"
              fill={fillColor}
            />
            <path d="M 11.5,30 C 17,27 28,27 33.5,30" />
            <path d="M 11.5,33.5 C 17,30.5 28,30.5 33.5,33.5" />
            <path d="M 11.5,37 C 17,34 28,34 33.5,37" />
          </g>
        </svg>
      );

    default:
      return null;
  }
});
