'use client';

import React from 'react';
import { Navbar } from '../layout/Navbar';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const About: React.FC = () => {

  return (
    <div className="">
      <Navbar onLogin={() => { }} onGetStarted={() => { }} />
      <h1>About</h1>
    </div>
  );
};

export default About;