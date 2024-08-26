import React from 'react';
import '../App.css'

const Home = () => {
  return (
    <div className="about-container">
      <section>
        <h2>Our Mission</h2>
        <p>
          Project Tracker is designed to streamline your project management process, 
          helping teams collaborate effectively and deliver results on time. Our mission 
          is to provide a user-friendly, powerful tool that enhances productivity and 
          ensures project success.
        </p>
      </section>
      
      <section>
        <h2>Key Features</h2>
        <ul>
          <li>Intuitive task management</li>
          <li>Real-time collaboration</li>
          <li>Customizable project dashboards</li>
          <li>Time tracking and reporting</li>
          <li>Integration with popular tools</li>
        </ul>
      </section>
      
      <section>
        <h2>Who We Serve</h2>
        <p>
          Whether you're a small startup, a growing business, or a large enterprise, 
          Project Tracker adapts to your needs. Our platform is perfect for project 
          managers, team leaders, and anyone looking to organize their work more efficiently.
        </p>
      </section>
      
      <section>
        <h2>Our Story</h2>
        <p>
          Founded in 2024, Project Tracker was born out of the frustration of 
          juggling multiple tools for project management. Our team of developers and 
          project management experts came together to create a comprehensive solution 
          that addresses the real-world challenges of modern project execution.
        </p>
      </section>
      
      <section>
        <h2>Get Started</h2>
        <p>
          Ready to take your project management to the next level? Sign up for a free 
          trial today and experience the difference Project Tracker can make for your team.
        </p>
        <button onClick={() => {/* Add navigation or modal trigger here */}}>
          Start Free Trial
        </button>
      </section>
    </div>
  );
};

export default Home;