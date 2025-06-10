export default function Stats() {
  const stats = [
    { value: "15,000+", label: "Projects Completed" },
    { value: "2,500+", label: "Verified Contractors" },
    { value: "98%", label: "Customer Satisfaction" },
    { value: "$2.3M", label: "Saved on Projects" },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold text-blue-600">{stat.value}</div>
              <div className="mt-2 text-lg text-slate-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
