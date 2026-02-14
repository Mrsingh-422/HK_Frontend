import React, { useState } from "react";
import "./Faqs.css";

function Faqs() {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: "What is the status of my order?",
      answer:
        "You can check your order status from your dashboard under 'My Orders'. You will also receive email updates regarding your shipment.",
    },
    {
      question: "How do I cancel or change my order?",
      answer:
        "Orders can be modified or canceled within 24 hours of placement. Please contact our support team for assistance.",
    },
    {
      question: "How long does it take to get my order?",
      answer:
        "Delivery usually takes 3-7 business days depending on your location.",
    },
    {
      question: "How much is shipping?",
      answer:
        "Shipping charges vary based on your location. Free shipping is available on orders above ₹999.",
    },
    {
      question: "Can I return my product?",
      answer:
        "Yes, we offer a 7-day return policy. The product must be unused and in original packaging.",
    },
    {
      question: "Do you offer customer support?",
      answer:
        "Yes! Our support team is available 24/7 via chat, email, and phone.",
    },
  ];

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="faq-section">
      <div className="faq-header">
        <h1>
          Frequently Asked Questions <span>(FAQ)</span>
        </h1>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Beatae,
          corrupti consectetur commodi voluptas ad dignissimos.
        </p>
      </div>

      <div className="faq-container">
        {/* Left Image */}
        <div className="faq-left">
          <img src='https://healthkangaroo.com/home/img/faq.png' alt="FAQ" />
        </div>

        {/* Right Accordion */}
        <div className="faq-right">
          {faqs.map((item, index) => (
            <div className="faq-item" key={index}>
              <div
                className="faq-question"
                onClick={() => toggleFAQ(index)}
              >
                <span>#{item.question}</span>
                <span
                  className={`arrow ${
                    activeIndex === index ? "rotate" : ""
                  }`}
                >
                  ▼
                </span>
              </div>

              {activeIndex === index && (
                <div className="faq-answer">
                  <p>{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Faqs;