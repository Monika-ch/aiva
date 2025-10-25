import React from "react";

const Hero: React.FC = () => {
  return (
    <section className="p-8">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-3">AIVA — AI Portfolio Assistant</h1>
      <p className="text-gray-700 mb-6">Create a professional narrative from your work history, tailor your portfolio, and get custom suggestions to impress recruiters and clients.</p>

      <div className="space-y-3">
        <div>
          <h3 className="font-semibold text-gray-900">Resume & Portfolio Review</h3>
          <p className="text-gray-600 text-sm">Get concise suggestions to improve clarity and impact.</p>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900">Project Storytelling</h3>
          <p className="text-gray-600 text-sm">Transform technical projects into compelling case studies.</p>
        </div>

        {/* <div>
          <h3 className="font-semibold text-gray-900">Interview Prep</h3>
          <p className="text-gray-600 text-sm">Practice common interview questions and receive tailored feedback.</p>
        </div> */}
      </div>
    </section>
  );
};

export default Hero;
