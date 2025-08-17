import { FileText, Download, DollarSign, PenTool, Building, ArrowRight, CheckCircle, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    // Navigate to the document selection page using React Router
    navigate('/documents');
  };

  const features = [
    {
      icon: <FileText className="w-8 h-8 text-blue-600" />,
      title: "Professional Documents",
      description: "Generate Letter of Employment, Experience Certificates, and Salary Certificates with custom branding."
    },
    {
      icon: <Download className="w-8 h-8 text-green-600" />,
      title: "High-Quality PDFs",
      description: "Export documents in multiple quality levels - Standard, High, and Ultra HD for professional printing."
    },
    {
      icon: <PenTool className="w-8 h-8 text-purple-600" />,
      title: "Digital Signatures",
      description: "Upload and integrate signature images directly into your documents for authenticity."
    },
    {
      icon: <Building className="w-8 h-8 text-orange-600" />,
      title: "Custom Branding",
      description: "Use your company's background images and templates for consistent corporate identity."
    }
  ];

  const benefits = [
    "Save time with automated document generation",
    "Ensure consistency across all HR documents",
    "Professional appearance with custom backgrounds",
    "Easy to use interface for HR professionals",
    "Secure and private document creation",
    "Multiple export quality options"
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "HR Manager",
      company: "TechCorp Solutions",
      content: "This portal has streamlined our document generation process. We can now create professional certificates in minutes instead of hours.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "HR Director",
      company: "Global Innovations",
      content: "The custom branding feature allows us to maintain our corporate identity while generating documents quickly and efficiently.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">HR Portal</span>
            </div>
                         <div className="flex items-center space-x-4">
               <button
                 onClick={() => navigate('/auth')}
                 className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
               >
                 Sign In
               </button>
               <button
                 onClick={handleGetStarted}
                 className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
               >
                 <span>Get Started</span>
                 <ArrowRight className="w-4 h-4" />
               </button>
             </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Streamline Your
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> HR Operations</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Generate professional employment documents, experience certificates, and salary certificates 
            with custom branding in minutes. Built for modern HR teams who value efficiency and quality.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold flex items-center justify-center space-x-2"
            >
              <span>Start Creating Documents</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/templates')}
              className="bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition-colors text-lg font-semibold flex items-center justify-center space-x-2"
            >
              <span>View All Templates</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white w-full">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Professional HR Documents
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our comprehensive suite of tools helps you create, customize, and export 
              professional HR documents with ease.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-50 to-indigo-50 w-full">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose HR Portal?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join hundreds of HR professionals who trust our platform for their document needs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                <span className="text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Document Types Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white w-full">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Professional Document Templates
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose from our carefully crafted templates designed for various HR scenarios.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-xl border border-blue-200">
              <div className="flex items-center space-x-3 mb-4">
                <FileText className="w-8 h-8 text-blue-600" />
                <h3 className="text-xl font-semibold text-blue-900">Letter of Employment</h3>
              </div>
              <p className="text-blue-800 mb-4">
                Professional employment verification letters with customizable content and company branding.
              </p>
              <ul className="text-blue-700 space-y-2">
                <li>• Employee details and position</li>
                <li>• Joining date and salary information</li>
                <li>• Company contact details</li>
                <li>• Digital signature integration</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-xl border border-green-200">
              <div className="flex items-center space-x-3 mb-4">
                <FileText className="w-8 h-8 text-green-600" />
                <h3 className="text-xl font-semibold text-green-900">Experience Certificate</h3>
              </div>
              <p className="text-green-800 mb-4">
                Comprehensive experience certificates highlighting employee contributions and achievements.
              </p>
              <ul className="text-green-700 space-y-2">
                <li>• Employment duration details</li>
                <li>• Role and responsibilities</li>
                <li>• Performance acknowledgment</li>
                <li>• Professional formatting</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-xl border border-purple-200">
              <div className="flex items-center space-x-3 mb-4">
                <DollarSign className="w-8 h-8 text-purple-600" />
                <div>
                  <h3 className="text-xl font-semibold text-purple-900">Salary Certificate</h3>
                </div>
              </div>
              <p className="text-purple-800 mb-4">
                Official salary verification documents for financial institutions and official purposes.
              </p>
              <ul className="text-purple-700 space-y-2">
                <li>• Current salary information</li>
                <li>• Currency and payment frequency</li>
                <li>• Employment verification</li>
                <li>• Official company stamp</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 w-full">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by HR Professionals
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See what our users say about their experience with HR Portal.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-gray-600">{testimonial.role} at {testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-600 w-full">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your HR Document Process?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of HR professionals who have already streamlined their document generation.
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors text-lg font-semibold flex items-center justify-center space-x-2 mx-auto"
          >
            <span>Start Creating Documents Now</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">HR Portal</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Professional HR document generation platform designed to streamline your workflow 
                and maintain corporate branding consistency.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
                  <span className="text-sm font-semibold">T</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
                  <span className="text-sm font-semibold">L</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
                  <span className="text-sm font-semibold">G</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Document Templates</li>
                <li>Custom Branding</li>
                <li>Digital Signatures</li>
                <li>High-Quality Export</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Documentation</li>
                <li>API Reference</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 HR Portal. All rights reserved. Built with modern web technologies.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
