"use client";

export type StatCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  color?: "blue" | "green" | "yellow" | "red" | "purple" | "gray";
  className?: string;
};

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = "blue",
  className,
}: StatCardProps) {
  const colors = {
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      icon: "text-blue-500",
    },
    green: {
      bg: "bg-green-50",
      text: "text-green-600",
      icon: "text-green-500",
    },
    yellow: {
      bg: "bg-yellow-50",
      text: "text-yellow-600",
      icon: "text-yellow-500",
    },
    red: {
      bg: "bg-red-50",
      text: "text-red-600",
      icon: "text-red-500",
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-600",
      icon: "text-purple-500",
    },
    gray: {
      bg: "bg-gray-50",
      text: "text-gray-600",
      icon: "text-gray-500",
    },
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow ${className || ""}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground/70 mb-2">{title}</p>
          <p className="text-3xl font-bold text-foreground mb-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-foreground/60">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <span
                className={`inline-flex items-center text-xs font-medium ${
                  trend.isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {trend.isPositive ? (
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l5-5 5 5M7 7l5 5 5-5" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-5 5-5-5M17 17l-5-5-5 5" />
                  </svg>
                )}
                {trend.value}%
              </span>
              {trend.label && (
                <span className="text-xs text-foreground/60 ml-1">{trend.label}</span>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-lg ${colors[color].bg}`}>
            <div className={`w-6 h-6 ${colors[color].icon}`}>
              {icon}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export type StatsGridProps = {
  stats: StatCardProps[];
  className?: string;
};

export function StatsGrid({ stats, className }: StatsGridProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className || ""}`}>
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}
