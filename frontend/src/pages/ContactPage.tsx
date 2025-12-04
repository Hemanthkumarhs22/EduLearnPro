import React from "react";
import { GoogleIcon } from "../components/Icon";

/**
 * Clean, hardcoded Contact Page with matching purple tone.
 * No dynamic footer detection. No runtime color logic.
 */
const ContactPage: React.FC = () => {
  // Your project’s consistent purple values (matching footer tone)
  const BRAND = "#6b21a8";          // primary-800 purple
  const TILE_BG = "#ede0f7";        // light lavender tile
  const ICON_BG = "#ffffff";        // icon chip bg
  const ICON_BORDER = "#e5d4f5";    // subtle outline

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-card p-8">

        <h1
          className="text-3xl font-heading font-semibold mb-3"
          style={{ color: BRAND }}
        >
          Contact Us
        </h1>

        <p className="text-gray-700 mb-6">
          Need assistance or want to connect with us? Here are our official contact details.
        </p>

        {/* Contact Cards */}
        <div className="space-y-6">

          {/* Email */}
          <a
            href="mailto:support@edulearnpro.example"
            className="block rounded-xl no-underline"
          >
            <div
              className="flex items-start gap-4 p-4 rounded-xl shadow-sm"
              style={{ backgroundColor: TILE_BG }}
            >
              <div
                className="p-3 rounded-lg shadow-sm flex items-center justify-center"
                style={{
                  backgroundColor: ICON_BG,
                  border: `1px solid ${ICON_BORDER}`,
                }}
              >
                <div style={{ color: BRAND }}>
                  <GoogleIcon name="mail" className="text-2xl" />
                </div>
              </div>

              <div>
                <div
                  className="font-heading font-semibold text-lg"
                  style={{ color: BRAND }}
                >
                  Email
                </div>
                <div className="text-gray-700 text-sm">
                  support@edulearnpro.example
                </div>
              </div>
            </div>
          </a>

          {/* Phone */}
          <a href="tel:+15551234567" className="block rounded-xl no-underline">
            <div
              className="flex items-start gap-4 p-4 rounded-xl shadow-sm"
              style={{ backgroundColor: TILE_BG }}
            >
              <div
                className="p-3 rounded-lg flex items-center justify-center"
                style={{
                  backgroundColor: ICON_BG,
                  border: `1px solid ${ICON_BORDER}`,
                }}
              >
                <div style={{ color: BRAND }}>
                  <GoogleIcon name="phone" className="text-2xl" />
                </div>
              </div>

              <div>
                <div
                  className="font-heading font-semibold text-lg"
                  style={{ color: BRAND }}
                >
                  Phone
                </div>
                <div className="text-gray-700 text-sm">+1 (555) 123-4567</div>
              </div>
            </div>
          </a>
        </div>

        <div className="mt-8 text-sm text-gray-500 text-center">
          Office Hours: Monday – Friday, 9:00 AM to 6:00 PM
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
