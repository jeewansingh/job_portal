import { Link } from "react-router-dom";
import "../styles/ProfileCompletionRing.css";

export default function ProfileCompletionRing({
  percentage,
  size = 120,
  showLink = true,
}) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const center = size / 2;

  return (
    <div className="profile-ring">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          className="profile-ring__track"
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth="8"
        />
        <circle
          className="profile-ring__progress"
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
        <text
          x={center}
          y={center + 6}
          textAnchor="middle"
          className="profile-ring__text"
        >
          {percentage}%
        </text>
      </svg>

      {/* {showLink && percentage < 100 && (
        <Link to="/profile" className="profile-ring__link">
          Complete profile
        </Link>
      )} */}
    </div>
  );
}
