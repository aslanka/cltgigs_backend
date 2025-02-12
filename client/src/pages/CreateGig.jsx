import React, { useState, useEffect } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { Range } from 'react-range';
import {
  Tag, MapPin, Calendar, Users, DollarSign, Plus, Minus, Upload,
  Award, Rocket, Sparkles, ArrowRight, Trophy, ClipboardList, Image, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function CreateGig() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [xpEarned, setXpEarned] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  // Form State
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [zipcode, setZipcode] = useState('');
  const [startDate, setStartDate] = useState('');
  const [completionDate, setCompletionDate] = useState('');
  const [teamSize, setTeamSize] = useState(1);
  const [gigTasks, setGigTasks] = useState([]);
  const [budgetRange, setBudgetRange] = useState([100, 1000]);
  const [isVolunteer, setIsVolunteer] = useState(false);
  const [tags, setTags] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [isService, setIsService] = useState(false);

  const steps = ['Basics', 'Details', 'Finalize'];
  const BASE_XP = 150;
  const BONUS_XP = 50;

  // Pre-built gig templates
  const templates = [
    {
      id: 1,
      name: "House Cleaning",
      title: "Sparkling House Cleaning Service",
      description: "I provide professional house cleaning services to keep your home spotless and inviting.",
      category: "Cleaning",
      teamSize: 1,
      gigTasks: ["Dusting", "Vacuuming", "Mopping"],
      budgetRange: [150, 300],
      isVolunteer: false,
      tags: "clean, home, service",
      isService: true,
    },
    {
      id: 2,
      name: "Roofing Repair",
      title: "Expert Roofing Repair & Installation",
      description: "Offering top-notch roofing repair and installation services with quality craftsmanship.",
      category: "Carpentry",
      teamSize: 2,
      gigTasks: ["Inspection", "Repair", "Installation"],
      budgetRange: [500, 2000],
      isVolunteer: false,
      tags: "roof, repair, construction",
      isService: false,
    },
    {
      id: 3,
      name: "Landscaping Design",
      title: "Creative Landscaping & Garden Design",
      description: "Transform your outdoor space with innovative landscaping and garden design services.",
      category: "Landscaping",
      teamSize: 1,
      gigTasks: ["Consultation", "Design", "Implementation"],
      budgetRange: [300, 1500],
      isVolunteer: false,
      tags: "landscape, garden, design",
      isService: true,
    },
  ];

  // Update the progress bar based on required fields (title, description, category, zipcode)
  useEffect(() => {
    const requiredFields = [title, description, category, zipcode];
    const filledCount = requiredFields.filter(field => field.trim() !== '').length;
    setCompletionPercentage((filledCount / requiredFields.length) * 100);
  }, [title, description, category, zipcode]);

  // When a template is selected, prefill the form values
  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setTitle(template.title);
    setDescription(template.description);
    setCategory(template.category);
    setTeamSize(template.teamSize);
    setGigTasks(template.gigTasks);
    setBudgetRange(template.budgetRange);
    setIsVolunteer(template.isVolunteer);
    setTags(template.tags);
    setIsService(template.isService);
  };

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
  
    // Validation
    if (teamSize < 1 || teamSize > 10) {
      setError('Team size must be between 1 and 10.');
      return;
    }
  
    if (!isVolunteer && (budgetRange[0] < 0 || budgetRange[1] < 0 || budgetRange[0] > budgetRange[1])) {
      setError('Invalid budget range. Minimum must be ≤ maximum.');
      return;
    }
  
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('zipcode', zipcode);
      formData.append('start_date', startDate);
      formData.append('completion_date', completionDate);
      formData.append('team_size', teamSize);
      formData.append('gig_tasks', JSON.stringify(gigTasks)); // stringify array
      formData.append('budget_range_min', budgetRange[0]);
      formData.append('budget_range_max', budgetRange[1]);
      formData.append('is_volunteer', isVolunteer);
      formData.append('tags', tags);
      formData.append('service_offered', isService);
      if (file) formData.append('gigImage', file);
  
      await axios.post('/gigs', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const totalXP = BASE_XP + (file ? BONUS_XP : 0);
      setXpEarned(totalXP);
      setShowSuccess(true);
      
      setTimeout(() => navigate('/'), 3000);
    } catch (err) {
      console.error(err);
      setError('Error creating gig. Please try again.');
    }
  };

  const addGigTask = () => {
    setGigTasks([...gigTasks, '']);
  };

  const updateGigTask = (index, value) => {
    const updatedTasks = [...gigTasks];
    updatedTasks[index] = value;
    setGigTasks(updatedTasks);
  };

  const removeGigTask = (index) => {
    setGigTasks(gigTasks.filter((_, i) => i !== index));
  };

  const CategoryButton = ({ children, active, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-3 rounded-xl transition-all text-sm font-medium flex justify-center ${
        active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-8 bg-gradient-to-r from-blue-700 to-purple-700 text-white">
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Rocket size={36} /> Create a Gig
            <span className="ml-auto bg-white/20 px-4 py-1 rounded-full flex items-center">
              <Award size={24} className="mr-2" /> +{BASE_XP} XP
            </span>
          </h1>
          <p className="mt-2 text-lg">Make your gig stand out with our easy step-by-step process.</p>
        </div>

        <div className="p-8">
          {/* Template Selection Section */}
          {!selectedTemplate && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Or Choose a Template</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <motion.div 
                    key={template.id}
                    whileHover={{ scale: 1.05 }}
                    className="border border-gray-200 rounded-xl p-4 cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <h3 className="text-xl font-bold mb-2">{template.name}</h3>
                    <p className="text-gray-600 text-sm">{template.description.substring(0, 80)}...</p>
                    <div className="mt-2 text-blue-600 font-semibold">Use Template</div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
          {selectedTemplate && (
            <div className="mb-8 p-4 border border-green-300 bg-green-50 rounded-xl flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Template Applied: {selectedTemplate.name}</h3>
                <p className="text-gray-600 text-sm">You can modify any field below.</p>
              </div>
              <button 
                onClick={() => setSelectedTemplate(null)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Clear Template
              </button>
            </div>
          )}

          {/* Steps Navigation & Progress */}
          <div className="mb-8">
            <div className="flex gap-2 mb-4">
              {steps.map((label, index) => (
                <button
                  key={label}
                  onClick={() => setStep(index + 1)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold ${
                    step === index + 1 
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="h-3 bg-gray-200 rounded-full">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-300" 
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg flex items-center gap-2">
              <span>⚠️</span>
              {error}
            </div>
          )}

          {/* Form Steps */}
          <AnimatePresence mode="wait">
            <motion.form
              key={step}
              onSubmit={handleSubmit}
              className="space-y-8"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
            >
              {/* Step 1: Basics */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">
                      <ClipboardList className="inline mr-2" /> Gig Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={handleInputChange(setTitle)}
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400"
                      placeholder="Enter gig title"
                    />
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                      <Sparkles size={16} /> Catchy titles attract more attention.
                    </p>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">
                      <ClipboardList className="inline mr-2" /> Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={description}
                      onChange={handleInputChange(setDescription)}
                      className="w-full p-4 border border-gray-300 rounded-xl h-32 focus:ring-2 focus:ring-blue-400"
                      placeholder="Describe your gig in detail..."
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">
                      <Tag className="inline mr-2" /> Category <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {['Carpentry', 'Cleaning', 'Electrical', 'Landscaping', 'Moving', 'Other'].map((cat) => (
                        <CategoryButton
                          key={cat}
                          active={category === cat}
                          onClick={() => setCategory(cat)}
                        >
                          {cat}
                        </CategoryButton>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-green-100 rounded-xl">
                    <input 
                      type="checkbox" 
                      id="isService" 
                      checked={isService}
                      onChange={(e) => setIsService(e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isService" className="flex items-center gap-2 text-gray-700">
                      <Rocket size={18} />
                      Service Offering
                    </label>
                  </div>
                </div>
              )}

              {/* Step 2: Details */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">
                        <MapPin className="inline mr-2" /> Zip Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={zipcode}
                        onChange={handleInputChange(setZipcode)}
                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400"
                        placeholder="Enter zip code"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">
                        <Calendar className="inline mr-2" /> Start Date
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full p-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">
                        <Users className="inline mr-2" /> Team Size
                      </label>
                      <div className="flex items-center gap-3 bg-gray-100 rounded-xl p-2">
                        <button
                          type="button"
                          onClick={() => setTeamSize(Math.max(1, teamSize - 1))}
                          className="p-2 rounded-lg bg-white shadow hover:bg-gray-50"
                        >
                          <Minus size={20} />
                        </button>
                        <div className="flex-1 flex items-center justify-center gap-2">
                          {Array.from({ length: teamSize }).map((_, index) => (
                            <div key={index} className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-gray-500" />
                            </div>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => setTeamSize(Math.min(10, teamSize + 1))}
                          className="p-2 rounded-lg bg-white shadow hover:bg-gray-50"
                        >
                          <Plus size={20} />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">
                        <Calendar className="inline mr-2" /> Completion Date
                      </label>
                      <input
                        type="date"
                        value={completionDate}
                        onChange={(e) => setCompletionDate(e.target.value)}
                        className="w-full p-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">
                      <Image className="inline mr-2" /> Upload Photos
                    </label>
                    <label className="block w-full h-32 border-2 border-dashed rounded-xl bg-gray-50 hover:bg-gray-100 transition cursor-pointer flex items-center justify-center">
                      <div className="flex flex-col items-center">
                        <Upload className="text-gray-500 mb-2" size={32} />
                        <span className="text-gray-600 text-sm">
                          {file ? file.name : 'Click or drag and drop to upload'}
                        </span>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => setFile(e.target.files[0])}
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Step 3: Finalize */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="bg-blue-50 p-6 rounded-2xl">
                    <h3 className="text-xl font-bold mb-4 flex items-center">
                      <DollarSign className="mr-2" /> Budget Settings
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-700 mb-2 font-medium">
                          Budget Range
                        </label>
                        <div className="px-2">
                          <Range
                            values={budgetRange}
                            step={50}
                            min={0}
                            max={10000}
                            onChange={values => setBudgetRange(values)}
                            renderTrack={({ props, children }) => (
                              <div
                                {...props}
                                className="h-3 bg-gray-300 rounded-full relative"
                              >
                                {children}
                              </div>
                            )}
                            renderThumb={({ props }) => (
                              <div
                                {...props}
                                className="h-6 w-6 bg-blue-600 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                              />
                            )}
                          />
                        </div>
                        <div className="flex justify-between text-sm mt-2 font-medium">
                          <span>${budgetRange[0]}</span>
                          <span>${budgetRange[1]}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsVolunteer(!isVolunteer)}
                        className={`w-full p-4 rounded-xl flex items-center justify-center transition-colors ${
                          isVolunteer
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                      >
                        {isVolunteer ? (
                          <>
                            <Trophy className="mr-2" /> Volunteer Opportunity
                          </>
                        ) : (
                          <>
                            <DollarSign className="mr-2" /> Paid Gig
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">
                      <Tag className="inline mr-2" /> Tags
                    </label>
                    <input
                      type="text"
                      value={tags}
                      onChange={handleInputChange(setTags)}
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400"
                      placeholder="e.g. urgent, weekend, outdoor"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">
                      Gig Tasks
                    </label>
                    <div className="space-y-3">
                      {gigTasks.map((task, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <input
                            type="text"
                            value={task}
                            onChange={(e) => updateGigTask(index, e.target.value)}
                            className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400"
                            placeholder="Enter task"
                          />
                          <button
                            type="button"
                            onClick={() => removeGigTask(index)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                          >
                            <Minus size={20} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addGigTask}
                        className="w-full p-3 text-blue-600 hover:bg-blue-50 rounded-xl flex items-center justify-center gap-2"
                      >
                        <Plus size={20} /> Add Task
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-4">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="flex-1 p-4 bg-gray-200 rounded-xl hover:bg-gray-300 transition"
                  >
                    Back
                  </button>
                )}
                
                <button
                  type={step < 3 ? 'button' : 'submit'}
                  onClick={() => step < 3 && setStep(step + 1)}
                  className={`flex-1 p-4 rounded-xl text-white transition-colors ${
                    step < 3
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {step < 3 ? (
                    <div className="flex items-center justify-center gap-2">
                      Continue <ArrowRight size={20} />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      Post Gig <Rocket size={20} />
                    </div>
                  )}
                </button>
              </div>
            </motion.form>
          </AnimatePresence>

          {/* Success Modal */}
          {showSuccess && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white p-8 rounded-2xl text-center max-w-md">
                <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 1, repeat: Infinity }} className="mb-4">
                  <Award size={56} className="text-yellow-500 mx-auto" />
                </motion.div>
                <h2 className="text-3xl font-bold mb-2">Gig Posted!</h2>
                <p className="text-xl mb-4 flex items-center justify-center gap-2">
                  <Award /> You earned {xpEarned} XP!
                </p>
                <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-2">Share your gig to earn bonus XP:</p>
                  <div className="flex justify-center gap-3">
                    <button className="p-3 rounded-full bg-blue-500 text-white">
                      <span className="sr-only">Twitter</span>🐦
                    </button>
                    <button className="p-3 rounded-full bg-blue-600 text-white">
                      <span className="sr-only">Facebook</span>📘
                    </button>
                    <button className="p-3 rounded-full bg-red-500 text-white">
                      <span className="sr-only">Email</span>📧
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default CreateGig;
