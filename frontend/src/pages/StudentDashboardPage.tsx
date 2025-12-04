import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import jsPDF from "jspdf";
import api from "../lib/api";
import type { Certificate, StudentDashboardData } from "../types";
import StatsGrid from "../components/StatsGrid";
import ProgressBar from "../components/ProgressBar";
import { Link } from "react-router-dom";

async function fetchDashboard() {
  const { data } = await api.get<StudentDashboardData>("/users/me/dashboard");
  return data;
}

function generateCertificatePdf(certificate: Certificate) {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const leftPanelWidth = pageWidth * 0.35;

  // Background colors
  doc.setFillColor("#1D4ED8");
  doc.rect(0, 0, leftPanelWidth, pageHeight, "F");

  doc.setFillColor("#F8FAFC");
  doc.rect(leftPanelWidth, 0, pageWidth - leftPanelWidth, pageHeight, "F");

  // Accent shapes
  doc.setFillColor("#FDBA74");
  doc.rect(leftPanelWidth - 25, 40, 60, 60, "F");
  doc.setFillColor("#22D3EE");
  doc.rect(pageWidth - 120, pageHeight - 140, 80, 80, "F");

  doc.setFillColor("#7C3AED");
  doc.triangle(
    leftPanelWidth - 40,
    pageHeight - 80,
    leftPanelWidth + 20,
    pageHeight,
    leftPanelWidth + 20,
    pageHeight - 80,
    "F"
  );

  // Left panel text
  doc.setTextColor("#FFFFFF");
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("Edu Learn Pro", leftPanelWidth / 2, 100, { align: "center" });

  doc.setFontSize(20);
  doc.text("Certificate", leftPanelWidth / 2, 180, { align: "center" });
  doc.setFontSize(16);
  doc.text("of Completion", leftPanelWidth / 2, 210, { align: "center" });

  // Main content
  doc.setTextColor("#0F172A");
  const startX = leftPanelWidth + 40;
  let cursorY = 120;

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("THIS CERTIFICATE IS PROUDLY PRESENTED TO", startX, cursorY);

  cursorY += 30;
  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  doc.text(certificate.student_name, startX, cursorY);

  cursorY += 30;
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text("for successfully completing the course", startX, cursorY);

  cursorY += 25;
  doc.setFont("helvetica", "bold");
  doc.text(certificate.course_title, startX, cursorY);

  cursorY += 50;
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Issued to: ${certificate.student_name}`, startX, cursorY);
  cursorY += 20;
  doc.text(`Completed on: ${new Date(certificate.issued_at).toLocaleDateString()}`, startX, cursorY);
  cursorY += 20;
  doc.text(`Progress: ${certificate.progress_percent}%`, startX, cursorY);

  cursorY += 40;
  doc.text("Congratulations on successfully completing your learning journey!", startX, cursorY);

  // Signature area
  cursorY = pageHeight - 120;
  doc.setFont("helvetica", "bold");
  doc.text("Natalie Taylor", startX, cursorY);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Course Speaker", startX, cursorY + 14);

  // Footer info
  const footerY = pageHeight - 80;
  doc.text(`Certificate ID: ${certificate.enrollment_id}`, startX, footerY);
  doc.text(
    `Issued: ${new Date(certificate.issued_at).toLocaleDateString()}`,
    startX + 250,
    footerY
  );

  return doc;
}

export default function StudentDashboardPage() {
  const [certificateMessage, setCertificateMessage] = useState<string | null>(null);
  const [certificateError, setCertificateError] = useState<string | null>(null);
  const { data, isLoading } = useQuery({ queryKey: ["student-dashboard"], queryFn: fetchDashboard });

  const handleDownloadCertificate = async (enrollmentId: string, courseTitle: string) => {
    try {
      setCertificateError(null);
      const { data: certificate } = await api.get<Certificate>(`/enrollments/${enrollmentId}/certificate`);
      const doc = generateCertificatePdf(certificate);
      doc.save(`certificate-${courseTitle.toLowerCase().replace(/\s+/g, "-")}.pdf`);
      setCertificateMessage(`Certificate downloaded for ${courseTitle}.`);
    } catch (error) {
      console.error("Failed to download certificate", error);
      setCertificateMessage(null);
      setCertificateError("Unable to download the certificate. Please try again later.");
    }
  };

  if (isLoading || !data) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-base-content">Student Dashboard</h1>
        <p className="text-sm text-base-content/70">Track your progress and continue learning.</p>
      </div>

      <StatsGrid
        stats={[
          { label: "Enrolled Courses", value: data.enrolled_courses },
          { label: "Completed Courses", value: data.completed_courses },
          { label: "Lessons Completed", value: data.total_lessons_completed },
          { label: "Recent Streak", value: `${Math.min(data.total_lessons_completed, 7)} days` },
        ]}
      />

      <section className="rounded-2xl border border-base-300 bg-base-200 p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-base-content">Course Progress</h2>
        {(certificateMessage || certificateError) && (
          <div
            className={`mt-3 rounded-lg border px-4 py-2 text-sm ${
              certificateError ? "border-error/30 bg-error/10 text-error" : "border-success/30 bg-success/10 text-success"
            }`}
          >
            {certificateError || certificateMessage}
          </div>
        )}
        <div className="mt-4 space-y-4">
          {data.progress_overview.length === 0 ? (
            <p className="text-sm text-base-content/70">Enroll in a course to start tracking progress.</p>
          ) : (
            data.progress_overview.map((progress) => (
              <div key={progress.course_id} className="rounded-lg border border-base-300 p-4 bg-base-100">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-base-content">{progress.course_title}</h3>
                    <p className="text-xs text-base-content/70">
                      Last viewed: {progress.last_viewed ? new Date(progress.last_viewed).toLocaleString() : "—"}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-primary">{progress.progress_percent}%</span>
                </div>
                <div className="mt-3">
                  <ProgressBar value={progress.progress_percent} />
                </div>
                <div className="mt-3 text-right">
                  <Link
                    to={`/learn/${progress.course_id}`}
                    className="text-sm font-semibold text-primary hover:text-primary-focus"
                  >
                    Continue learning →
                  </Link>
                  {progress.progress_percent >= 100 && (
                    <button
                      onClick={() => handleDownloadCertificate(progress.enrollment_id, progress.course_title)}
                      className="ml-3 rounded-md bg-primary px-3 py-3 text-xs font-semibold text-primary-content hover:bg-primary-focus"
                    >
                      Download certificate
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-base-300 bg-base-200 p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-base-content">Recent Activity</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {data.recent_activity.length === 0 ? (
            <li className="text-base-content/70">No activity yet. Start learning to build your streak!</li>
          ) : (
            data.recent_activity.map((activity, index) => (
              <li key={`${activity.lesson_id}-${index}`} className="flex items-center justify-between">
                <span>Lesson completed</span>
                <span className="text-base-content/70">
                  {activity.completed_at ? new Date(activity.completed_at).toLocaleString() : "Just now"}
                </span>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
