import React, { useState, useEffect } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate, useParams } from 'react-router-dom';
import { Range } from 'react-range';
import {
  Tag, MapPin, Calendar, Users, DollarSign, Plus, Minus, Upload,
  Award, Rocket, Sparkles, ArrowRight, Trophy, ClipboardList, Image, User, Check, Trash
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function EditGig() {
  const navigate = useNavigate();
  const { gigId } = useParams();
  const [step, setStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [existingAttachment, setExistingAttachment] = useState(null);

  // Form State
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

  const steps = ['Basics', 'Details', 'Finalize'];

  useEffect(() => {
    const fetchGig = async () => {
      try {
        const response = await axios.get(`/gigs/${gigId}`);
        const { gig, attachments } = response.data;
        
        setTitle(gig.title);
        setDescription(gig.description);
        setCategory(gig.category);
        setZipcode(gig.zipcode);
        setStartDate(gig.start_date?.split('T')[0] || '');
        setCompletionDate(gig.completion_date?.split('T')[0] || '');
        setTeamSize(gig.team_size);
        setGigTasks(gig.gig_tasks);
        const initialBudget = gig.is_volunteer ? [100, 1000] : [ // Default to paid range if switching
          gig.budget_range_min || 100,
          gig.budget_range_max || 1000
        ];
        setBudgetRange(initialBudget);
        setIsVolunteer(gig.is_volunteer);
        setTags(gig.tags?.join(', ') || '');
        
        if (attachments.length > 0) {
          setExistingAttachment(attachments[0].file_url);
        }
      } catch (err) {
        setError('Failed to load gig details');
      }
    };
    
    fetchGig();
  }, [gigId]);

  useEffect(() => {
    const requiredFields = [title, description, category, zipcode];
    const filledCount = requiredFields.filter(field => field.trim() !== '').length;
    setCompletionPercentage((filledCount / requiredFields.length) * 100);
  }, [title, description, category, zipcode]);

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
  
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('zipcode', zipcode);
      formData.append('start_date', startDate);
      formData.append('completion_date', completionDate);
      formData.append('team_size', teamSize.toString());
      formData.append('gig_tasks', JSON.stringify(gigTasks));
      formData.append('is_volunteer', isVolunteer.toString());
      formData.append('tags', tags);
  
      // Only add budget fields for paid gigs
      if (!isVolunteer) {
        formData.append('budget_range_min', budgetRange[0].toString());
        formData.append('budget_range_max', budgetRange[1].toString());
      }
  
      if (file) {
        formData.append('gigImage', file);
      }
  
      const response = await axios.put(`/gigs/${gigId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
  
      if (response.status === 200) {
        setShowSuccess(true);
        setTimeout(() => navigate('/mygigs'), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error updating gig. Please try again.');
    }
  };
  
  // Update the fetchGig useEffect
  useEffect(() => {
    const fetchGig = async () => {
      try {
        const response = await axios.get(`/gigs/${gigId}`);
        const { gig, attachments } = response.data;
        
        setTitle(gig.title);
        setDescription(gig.description);
        setCategory(gig.category);
        setZipcode(gig.zipcode);
        setStartDate(gig.start_date?.split('T')[0] || '');
        setCompletionDate(gig.completion_date?.split('T')[0] || '');
        setTeamSize(gig.team_size);
        setGigTasks(gig.gig_tasks);
        setIsVolunteer(gig.is_volunteer);
        setTags(gig.tags?.join(', ') || '');
  
        // Set budget only for paid gigs
        if (!gig.is_volunteer) {
          setBudgetRange([
            gig.budget_range_min || 100,
            gig.budget_range_max || 1000
          ]);
        }
        
        if (attachments.length > 0) {
          setExistingAttachment(attachments[0].file_url);
        }
      } catch (err) {
        setError('Failed to load gig details');
      }
    };
    fetchGig();
  }, [gigId]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to permanently delete this gig?')) {
      try {
        await axios.delete(`/gigs/${gigId}`);
        navigate('/mygigs');
      } catch (err) {
        setError('Failed to delete gig');
      }
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
    const updatedTasks = gigTasks.filter((_, i) => i !== index);
    setGigTasks(updatedTasks);
  };

  const CategoryButton = ({ children, active, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-3 md:p-2 text-sm md:text-base flex-1 rounded-lg transition-all ${
        active ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Rocket size={32} /> Edit Gig
            <div className="ml-auto flex gap-2">
              <button
                onClick={handleDelete}
                className="bg-red-500/20 px-4 py-1 rounded-full flex items-center hover:bg-red-600/30 transition-colors"
              >
                <Trash size={20} className="mr-2" /> Delete
              </button>
            </div>
          </h1>
        </div>

        {existingAttachment && (
          <div className="p-4 border-b">
            <label className="block text-gray-700 mb-2 font-medium">
              <Image className="inline mr-2" />
              Current Image
            </label>
            <img 
              crossOrigin='anonymous'
              src={existingAttachment} 
              alt="Current Gig" 
              className="w-32 h-32 object-cover rounded-lg"
            />
          </div>
        )}

        <div className="p-4 md:p-8">
          <div className="mb-8">
            <div className="flex gap-2 mb-4">
              {steps.map((label, index) => (
                <button
                  key={label}
                  onClick={() => setStep(index + 1)}
                  className={`px-4 py-2 rounded-full text-sm ${
                    step === index + 1 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="h-2 bg-gray-200 rounded-full">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-300" 
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center">
              <span className="mr-2">⚠️</span>
              {error}
            </div>
          )}

          <AnimatePresence mode='wait'>
            <motion.form
              key={step}
              onSubmit={handleSubmit}
              className="space-y-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">
                      <ClipboardList className="inline mr-2" />
                      Gig Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={handleInputChange(setTitle)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Professional Roofing Project"
                    />
                    <div className="text-sm text-gray-500 mt-2 flex items-center">
                      <Sparkles size={14} className="mr-2" /> Catchy titles get 2x more views!
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">
                      <ClipboardList className="inline mr-2" />
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={handleInputChange(setDescription)}
                      className="w-full p-3 border border-gray-300 rounded-lg h-32 focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe the gig in detail..."
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">
                      <Tag className="inline mr-2" />
                      Category
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
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
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">
                        <MapPin className="inline mr-2" />
                        Zip Code
                      </label>
                      <input
                        type="text"
                        value={zipcode}
                        onChange={handleInputChange(setZipcode)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter zip code"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">
                        <Calendar className="inline mr-2" />
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">
                        <Users className="inline mr-2" />
                        Team Size
                      </label>
                      <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                        <button
                          type="button"
                          onClick={() => setTeamSize(Math.max(1, teamSize - 1))}
                          className="p-2 rounded-lg bg-white shadow-sm hover:bg-gray-50"
                        >
                          <Minus size={20} />
                        </button>
                        <div className="flex-1 flex items-center justify-center gap-2">
                          {Array.from({ length: teamSize }).map((_, index) => (
                            <div key={index} className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-500" />
                            </div>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => setTeamSize(Math.min(10, teamSize + 1))}
                          className="p-2 rounded-lg bg-white shadow-sm hover:bg-gray-50"
                        >
                          <Plus size={20} />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">
                        <Calendar className="inline mr-2" />
                        Completion Date
                      </label>
                      <input
                        type="date"
                        value={completionDate}
                        onChange={(e) => setCompletionDate(e.target.value)}
                        className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">
                      <Image className="inline mr-2" />
                      Update Photos
                    </label>
                    <label className="block w-full h-32 border-2 border-dashed rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="h-full flex flex-col items-center justify-center">
                        <Upload className="text-gray-400 mb-2" />
                        <span className="text-gray-500 text-sm">
                          {file ? file.name : 'Click to upload or drag and drop'}
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

              {step === 3 && (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <DollarSign className="mr-2" />
                      Budget Settings
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-700 mb-2">
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
                                className="h-2 bg-gray-200 rounded-full relative"
                              >
                                <div className="absolute w-px h-full bg-gray-400 left-1/2 transform -translate-x-1/2" />
                                {children}
                              </div>
                            )}
                            renderThumb={({ props }) => (
                              <div
                                {...props}
                                className="h-6 w-6 bg-blue-500 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                              />
                            )}
                          />
                        </div>
                        <div className="flex justify-between text-sm mt-2">
                          <span>${budgetRange[0]}</span>
                          <span>${budgetRange[1]}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsVolunteer(!isVolunteer)}
                        className={`w-full p-3 rounded-lg flex items-center justify-center transition-colors ${
                          isVolunteer
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                      >
                        {isVolunteer ? (
                          <>
                            <Trophy className="mr-2" />
                            Volunteer Opportunity
                          </>
                        ) : (
                          <>
                            <DollarSign className="mr-2" />
                            Paid Gig
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">
                      <Tag className="inline mr-2" />
                      Tags
                    </label>
                    <input
                      type="text"
                      value={tags}
                      onChange={handleInputChange(setTags)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="urgent, weekend, outdoor"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">
                      Gig Tasks
                    </label>
                    <div className="space-y-2">
                      {gigTasks.map((task, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={task}
                            onChange={(e) => updateGigTask(index, e.target.value)}
                            className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter task"
                          />
                          <button
                            type="button"
                            onClick={() => removeGigTask(index)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <Minus size={18} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addGigTask}
                        className="w-full p-2 text-blue-500 hover:bg-blue-50 rounded-lg flex items-center justify-center gap-2"
                      >
                        <Plus size={18} /> Add Task
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="flex-1 p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Back
                  </button>
                )}
                
                <button
                  type={step < 3 ? 'button' : 'submit'}
                  onClick={() => step < 3 && setStep(step + 1)}
                  className={`flex-1 p-3 rounded-lg text-white transition-colors ${
                    step < 3
                      ? 'bg-blue-500 hover:bg-blue-600'
                      : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  {step < 3 ? (
                    <>
                      Continue
                      <ArrowRight className="inline ml-2" />
                    </>
                  ) : (
                    <>
                      Update Gig
                      <Rocket className="inline ml-2" />
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          </AnimatePresence>

          {showSuccess && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
              <div className="bg-white p-8 rounded-2xl text-center max-w-md">
                <div className="animate-bounce mb-4">
                  <Award size={48} className="text-yellow-400 mx-auto" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Gig Updated!</h2>
                <p className="text-lg mb-4 flex items-center justify-center">
                  <Award className="mr-2" /> Your changes have been saved
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EditGig;