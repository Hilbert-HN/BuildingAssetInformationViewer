import React from 'react';
import { Code, Layout, Palette } from 'lucide-react';
import { useInView } from '../hooks/useInView';

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

const Feature: React.FC<FeatureProps> = ({ icon, title, description, delay }) => {
  const [ref, isInView] = useInView({ threshold: 0.1 });
  
  return (
    <div 
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all duration-700 ease-out transform ${
        isInView 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-10'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-100 text-blue-500 mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

const Features: React.FC = () => {
  const features = [
    {
      icon: <Layout size={24} />,
      title: "Responsive Design",
      description: "Looks beautiful on all devices, from mobile to desktop.",
      delay: 0
    },
    {
      icon: <Palette size={24} />,
      title: "Modern Aesthetics",
      description: "Clean, minimal design with attention to typography and spacing.",
      delay: 150
    },
    {
      icon: <Code size={24} />,
      title: "TypeScript & React",
      description: "Built with modern web technologies for performance and reliability.",
      delay: 300
    }
  ];

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800">Key Features</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Designed with simplicity and elegance in mind
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Feature 
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={feature.delay}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;