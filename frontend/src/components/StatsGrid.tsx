interface Stat {
  label: string;
  value: string | number;
  description?: string;
  gradient?: string;
  icon?: string;
}

const defaultGradients = [
  "from-primary to-primary",
  "from-primary to-primary",
  "from-primary to-primary",
  "from-primary to-primary",
];

export default function StatsGrid({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        return (
          <div
            key={stat.label}
            className="group relative overflow-hidden rounded-2xl bg-primary p-6 text-primary-content shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <div className="absolute inset-0 bg-black/10 opacity-0 transition-opacity group-hover:opacity-100"></div>
            <div className="relative z-10">
              {stat.icon && <div className="mb-3 text-4xl">{stat.icon}</div>}
              <p className="text-sm font-medium text-primary-content">{stat.label}</p>
              <p className="mt-2 text-3xl font-extrabold text-primary-content">{stat.value}</p>
              {stat.description && <p className="mt-2 text-xs text-primary-content">{stat.description}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
