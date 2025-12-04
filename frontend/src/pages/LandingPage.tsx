import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import api from "../lib/api";
import { Icon } from "../components/Icon";

interface PlatformStats {
  total_students: number;
  total_instructors: number;
  total_courses: number;
  satisfaction_rate: number;
}

async function fetchStats() {
  const { data } = await api.get<PlatformStats>("/stats");
  return data;
}

export default function LandingPage() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["platform-stats"],
    queryFn: fetchStats,
  });

  const features = [
    {
      title: "Flexible learning",
      description: "Learn at your own pace with our flexible course structure designed for busy schedules.",
      gradient: "from-primary to-primary",
      icon: "school",
    },
    {
      title: "Data-driven insights",
      description: "Track your progress with detailed analytics and personalized recommendations.",
      gradient: "from-primary to-primary",
      icon: "query_stats",
    },
    {
      title: "Instructors first",
      description: "Empower educators with powerful tools to create and manage engaging courses.",
      gradient: "from-primary to-primary",
      icon: "co_present",
    },
  ];

  const benefits = [
    {
      title: "Self-Paced Learning",
      description: "Study whenever and wherever you want. No rigid schedules or deadlines to stress about.",
      icon: "schedule",
    },
    {
      title: "Expert Instructors",
      description: "Learn from industry professionals and experienced educators who are passionate about teaching.",
      icon: "co_present",
    },
    {
      title: "Interactive Content",
      description: "Engage with video lessons, quizzes, and hands-on projects that make learning fun and effective.",
      icon: "movie",
    },
    {
      title: "Progress Tracking",
      description: "Monitor your learning journey with detailed progress reports and completion certificates.",
      icon: "trending_up",
    },
    {
      title: "Community Support",
      description: "Connect with fellow learners, share knowledge, and get help when you need it.",
      icon: "group",
    },
    {
      title: "Affordable Pricing",
      description: "Access high-quality education at competitive prices. Learn without breaking the bank.",
      icon: "savings",
    },
  ];

  const instructorFeatures = [
    {
      title: "Easy Course Creation",
      description: "Create and organize your courses with our intuitive course builder. Add lessons, videos, and materials in minutes.",
      icon: "auto_awesome",
    },
    {
      title: "Student Analytics",
      description: "Track student engagement, completion rates, and performance metrics to improve your teaching.",
      icon: "query_stats",
    },
    {
      title: "Flexible Content Management",
      description: "Upload videos, documents, and interactive content. Organize everything the way you want.",
      icon: "folder_open",
    },
    {
      title: "Monetization Options",
      description: "Set your own pricing and earn from your expertise. Build a sustainable teaching business.",
      icon: "payments",
    },
  ];

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl p-12 text-center shadow-2xl shadow-glow animate-shimmer" style={{ backgroundColor: 'oklch(37.45% 0.189 325.02)' }}>
        <div className="relative z-10">
          <h2 className="text-5xl md:text-5xl font-extrabold text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] animate-pulse-slow">
            Learning reimagined for the modern era
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-xl text-white font-medium drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
            Discover curated courses, track your progress seamlessly, and empower your career growth on Edu Learn Pro.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              to="/catalog"
              className="group rounded-xl bg-white px-8 py-4 text-lg font-bold text-primary shadow-xl transition-all hover:scale-110 hover:shadow-2xl hover:rotate-1"
            >
              <span className="inline-flex items-center gap-2 group-hover:animate-bounce">
                <Icon name="rocket_launch" className="text-2xl" />
                <span>Explore Courses</span>
              </span>
            </Link>
            {user ? (
              <Link
                to={user.role === "instructor" ? "/instructor" : "/student"}
                className="rounded-xl border-2 border-white/30 bg-white/20 backdrop-blur-sm px-8 py-4 text-lg font-bold text-white drop-shadow-lg transition-all hover:bg-white/30 hover:scale-110 hover:rotate-1"
              >
                <span className="inline-flex items-center gap-2">
                  <Icon name="dashboard" className="text-2xl" />
                  <span>Go to Dashboard</span>
                </span>
              </Link>
            ) : (
              <Link
                to="/register"
                className="rounded-xl border-2 border-white/30 bg-white/20 backdrop-blur-sm px-8 py-4 text-lg font-bold text-white drop-shadow-lg transition-all hover:bg-white/30 hover:scale-110 hover:rotate-1"
              >
                <span className="inline-flex items-center gap-2">
                  <Icon name="auto_awesome" className="text-2xl" />
                  <span>Join for free</span>
                </span>
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {features.map((feature, index) => (
          <div
            key={feature.title}
            className="group relative overflow-hidden rounded-2xl bg-primary p-8 text-primary-content shadow-xl transition-all duration-300 hover-lift cursor-pointer"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="absolute inset-0 bg-black/10 opacity-0 transition-opacity group-hover:opacity-100"></div>
            <div className="relative z-10">
              <div className="mb-4 text-5xl animate-float" style={{ animationDelay: `${index * 0.2}s` }}>
                <Icon name={feature.icon} className="text-5xl" />
              </div>
              <h3 className="text-2xl font-bold group-hover:scale-105 transition-transform">{feature.title}</h3>
              <p className="mt-4 text-primary-content">{feature.description}</p>
            </div>
          </div>
        ))}
      </section>

      {/* About Section */}
      <section className="rounded-3xl bg-base-200 p-12 shadow-xl">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gradient mb-6">About Edu Learn Pro</h2>
          <p className="text-lg text-base-content leading-relaxed mb-4">
            Edu Learn Pro is a cutting-edge e-learning platform designed to revolutionize the way people learn and teach. 
            We believe that education should be accessible, flexible, and engaging for everyone.
          </p>
          <p className="text-lg text-base-content leading-relaxed mb-4">
            Founded with a vision to bridge the gap between learners and educators, we provide a comprehensive platform 
            where students can discover high-quality courses and instructors can share their expertise with the world.
          </p>
          <p className="text-lg text-base-content leading-relaxed">
            Our mission is to make learning a lifelong journey that's enjoyable, rewarding, and accessible to all, 
            regardless of location, schedule, or background.
          </p>
        </div>
      </section>

      {/* How Teaching is Made Easier */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gradient mb-4 leading-normal pb-3">Teaching Made Easier</h2>
          <p className="text-xl text-base-content/70 max-w-3xl mx-auto">
            We've built powerful tools that simplify course creation and management, so you can focus on what you do best - teaching.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {instructorFeatures.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl bg-base-200 border-2 border-base-300 p-6 shadow-lg hover-lift transition-all duration-300"
            >
              {/* <div className="text-4xl mb-4">{feature.icon}</div> */}
              <h3 className="text-xl font-bold text-base-content mb-3">{feature.title}</h3>
              <p className="text-base-content/70 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits for Students */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gradient mb-4 leading-normal pb-3">Why Choose Edu Learn Pro?</h2>
          <p className="text-xl text-base-content/70 max-w-3xl mx-auto">
            Discover the benefits that make learning with us a unique and rewarding experience.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="group rounded-2xl bg-base-200 border-2 border-base-300 p-6 shadow-lg hover-lift transition-all duration-300"
            >
              {/* <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{benefit.icon}</div> */}
              <h3 className="text-xl font-bold text-base-content mb-3">{benefit.title}</h3>
              <p className="text-base-content/70 leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="rounded-3xl bg-base-200 p-12 shadow-xl">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gradient text-center mb-12">How It Works</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-3xl font-bold text-primary-content mx-auto mb-4 shadow-lg">
                1
              </div>
              <h3 className="text-2xl font-bold text-base-content mb-3">Sign Up</h3>
              <p className="text-base-content/70">
                Create your free account in seconds. Choose to be a student or instructor based on your goals.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-3xl font-bold text-primary-content mx-auto mb-4 shadow-lg">
                2
              </div>
              <h3 className="text-2xl font-bold text-base-content mb-3">Explore or Create</h3>
              <p className="text-base-content/70">
                Browse our catalog of courses or start creating your own. The platform is designed for both learners and educators.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-3xl font-bold text-primary-content mx-auto mb-4 shadow-lg">
                3
              </div>
              <h3 className="text-2xl font-bold text-base-content mb-3">Start Learning</h3>
              <p className="text-base-content/70">
                Enroll in courses, track your progress, and earn certificates. For instructors, manage students and grow your audience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="rounded-3xl bg-primary p-12 text-primary-content shadow-2xl" style={{ backgroundColor: 'oklch(37.45% 0.189 325.02)' }}>
        <div className="grid gap-8 md:grid-cols-4 text-center">
          <div>
            <div className="text-5xl font-extrabold mb-2 text-white">
              {statsLoading ? (
                <span className="inline-block h-12 w-20 animate-pulse bg-white/20 rounded"></span>
              ) : (
                `${stats?.total_students.toLocaleString() || 0}+`
              )}
            </div>
            <div className="text-xl opacity-90 text-white">Active Students</div>
          </div>
          <div>
            <div className="text-5xl font-extrabold mb-2 text-white">
              {statsLoading ? (
                <span className="inline-block h-12 w-20 animate-pulse bg-white/20 rounded"></span>
              ) : (
                `${stats?.total_instructors.toLocaleString() || 0}+`
              )}
            </div>
            <div className="text-xl opacity-90 text-white">Expert Instructors</div>
          </div>
          <div>
            <div className="text-5xl font-extrabold mb-2 text-white">
              {statsLoading ? (
                <span className="inline-block h-12 w-20 animate-pulse bg-white/20 rounded"></span>
              ) : (
                `${stats?.total_courses.toLocaleString() || 0}+`
              )}
            </div>
            <div className="text-xl opacity-90 text-white">Courses Available</div>
          </div>
          <div>
            <div className="text-5xl font-extrabold mb-2 text-white">
              {statsLoading ? (
                <span className="inline-block h-12 w-20 animate-pulse bg-white/20 rounded"></span>
              ) : (
                `${stats?.satisfaction_rate.toFixed(1) || 0}%`
              )}
            </div>
            <div className="text-xl opacity-90 text-white">Satisfaction Rate</div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="rounded-3xl bg-base-300 p-12 text-center text-base-content shadow-2xl">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-6">Ready to Start Your Learning Journey?</h2>
        <p className="text-xl text-base-content mb-8 max-w-2xl mx-auto">
          Join thousands of learners and instructors who are already transforming their lives with Edu Learn Pro.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {user ? (
            <Link
              to={user.role === "instructor" ? "/instructor" : "/student"}
              className="rounded-xl bg-primary px-8 py-4 text-lg font-bold text-primary-content shadow-lg transition-all hover:scale-110 hover:shadow-xl"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="rounded-xl bg-primary px-8 py-4 text-lg font-bold text-primary-content shadow-lg transition-all hover:scale-110 hover:shadow-xl"
              >
                Get Started Free
              </Link>
              <Link
                to="/catalog"
                className="rounded-xl border-2 border-base-content/30 bg-base-200 px-8 py-4 text-lg font-bold text-base-content transition-all hover:bg-base-100 hover:scale-110"
              >
                Browse Courses
              </Link>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
