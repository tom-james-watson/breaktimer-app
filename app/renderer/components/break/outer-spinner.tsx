interface OuterSpinnerProps {
  value: number;
  textColor: string;
}

export function OuterSpinner({ textColor, value }: OuterSpinnerProps) {
  return (
    <div className="absolute">
      <svg width="400" height="400" strokeWidth="2" viewBox="2 2 96 96">
        <path
          className="spinner-track"
          d="M 50,50 m 0,-45 a 45,45 0 1 1 0,90 a 45,45 0 1 1 0,-90"
          style={{ stroke: "none", fill: "transparent" }}
        ></path>
        <path
          className="spinner-head"
          d="M 50,50 m 0,-45 a 45,45 0 1 1 0,90 a 45,45 0 1 1 0,-90"
          pathLength="100"
          strokeDasharray="100 100"
          strokeDashoffset={100 - 100 * value}
          style={{ stroke: textColor, fill: "transparent" }}
        ></path>
      </svg>
    </div>
  );
}
