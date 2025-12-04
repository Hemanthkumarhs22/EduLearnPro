import React, { useEffect, useState } from 'react';
import { GoogleIcon } from '../components/Icon';

/**
 * AboutPage that dynamically picks the exact footer color at runtime
 * so tiles/headings/icons match the footer perfectly.
 *
 * No other files changed.
 */
const AboutPage: React.FC = () => {
  // store the computed color strings
  const [brandColor, setBrandColor] = useState<string>('#581c87');
  const [brandSurface, setBrandSurface] = useState<string>('rgba(88,28,135,0.08)');

  // utility: convert "rgb(r,g,b)" or "rgba(r,g,b,a)" to rgba with given alpha
  const toRgbaWithAlpha = (cssColor: string, alpha = 0.08) => {
    try {
      // extract numbers
      const nums = cssColor.match(/[\d.]+/g);
      if (!nums || nums.length < 3) return `rgba(88,28,135,${alpha})`;
      const r = Number(nums[0]), g = Number(nums[1]), b = Number(nums[2]);
      return `rgba(${r},${g},${b},${alpha})`;
    } catch {
      return `rgba(88,28,135,${alpha})`;
    }
  };

  useEffect(() => {
    // Try several selectors to locate the footer element in your app.
    const selectors = [
      'footer',
      '.site-footer',
      '#footer',
      '.footer',
      'body > div:last-child footer', // fallback
    ];

    let el: Element | null = null;
    for (const sel of selectors) {
      el = document.querySelector(sel);
      if (el) break;
    }

    // If footer not found, try to find element with footer-like background
    if (!el) {
      // try to find any element with a deep purple background already
      const candidates = Array.from(document.querySelectorAll('div,footer,header'));
      el = candidates.find((c) => {
        const bg = getComputedStyle(c).backgroundColor || '';
        // crude check for non-transparent background
        return bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'rgb(255, 255, 255)';
      }) || null;
    }

    if (el) {
      const computed = getComputedStyle(el).backgroundColor || '';
      if (computed) {
        setBrandColor(computed);
        setBrandSurface(toRgbaWithAlpha(computed, 0.08));
        return;
      }
    }

    // fallback values if all else fails
    setBrandColor('#581c87');
    setBrandSurface('rgba(88,28,135,0.08)');
  }, []);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="bg-white rounded-xl shadow-card p-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row gap-8 items-center">
          {/* Icon box with wrapper color so GoogleIcon inherits it */}
          <div
            className="w-32 h-32 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: brandSurface }}
          >
            <div style={{ color: brandColor }}>
              <GoogleIcon name="school" className="text-4xl" />
            </div>
          </div>

          {/* Text section */}
          <div className="flex-1">
            <h1
              className="text-3xl font-heading font-semibold mb-3"
              style={{ color: brandColor }}
            >
              About EduLearnPro
            </h1>

            <p className="text-gray-700 mb-4 leading-relaxed">
              EduLearnPro is a modern learning platform built to help students and instructors create,
              share and consume high-quality courses. Our mission is to make learning accessible and engaging.
            </p>

            {/* Tiles — use the exact footer color as background */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div
                className="p-5 text-white rounded-xl shadow-md"
                style={{ backgroundColor: brandColor }}
              >
                <h4 className="font-semibold">Mission</h4>
                <p className="text-sm text-white/90 mt-2">
                  Deliver accessible learning and real outcomes.
                </p>
              </div>

              <div
                className="p-5 text-white rounded-xl shadow-md"
                style={{ backgroundColor: brandColor }}
              >
                <h4 className="font-semibold">Vision</h4>
                <p className="text-sm text-white/90 mt-2">
                  Empower creators and learners worldwide.
                </p>
              </div>

              <div
                className="p-5 text-white rounded-xl shadow-md"
                style={{ backgroundColor: brandColor }}
              >
                <h4 className="font-semibold">Values</h4>
                <p className="text-sm text-white/90 mt-2">
                  Quality, Accessibility & Community.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="mt-10 border-t pt-6 text-gray-700">
          <h3 className="text-xl font-heading font-semibold mb-3">Team</h3>
          <p className="text-sm leading-relaxed">
            Our team includes experienced educators, designers, and engineers committed to building a great learning experience.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
