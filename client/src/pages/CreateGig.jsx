import React, { useState } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { Range } from 'react-range'; // For the budget range slider
import {
  Tag,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Check,
  Plus,
  Minus,
  Upload,
  User,
} from 'lucide-react';

function CreateGig() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [zipcode, setZipcode] = useState('');
  const [startDate, setStartDate] = useState('');
  const [completionDate, setCompletionDate] = useState('');
  const [teamSize, setTeamSize] = useState(1);
  const [gigTasks, setGigTasks] = useState([]);
  const [budgetRange, setBudgetRange] = useState([0, 1000]); // [min, max]
  const [isVolunteer, setIsVolunteer] = useState(false);
  const [tags, setTags] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate team size
    if (teamSize < 1 || teamSize > 100) {
      setError('Team size must be between 1 and 100.');
      return;
    }

    // Validate budget range
    if (!isVolunteer && (budgetRange[0] < 0 || budgetRange[1] < 0 || budgetRange[0] > budgetRange[1])) {
      setError('Invalid budget range. Minimum must be less than or equal to maximum.');
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
      formData.append('gig_tasks', JSON.stringify(gigTasks));
      formData.append('budget_range_min', budgetRange[0]);
      formData.append('budget_range_max', budgetRange[1]);
      formData.append('is_volunteer', isVolunteer);
      formData.append('tags', tags);
      if (file) {
        formData.append('gigImage', file);
      }

      await axios.post('/gigs', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Gig created successfully!');
      navigate('/');
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
    const updatedTasks = gigTasks.filter((_, i) => i !== index);
    setGigTasks(updatedTasks);
  };

  const addTeamMember = () => {
    if (teamSize < 100) {
      setTeamSize((prev) => prev + 1);
    }
  };

  const removeTeamMember = () => {
    if (teamSize > 1) {
      setTeamSize((prev) => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg">
        <div className="p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Post a Gig</h1>

          {error && <div className="text-red-500 mb-6">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gig Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Professional Roofing Project"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
                placeholder="Describe the gig in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="" disabled>Select a category</option>
                <option value="Music">Music</option>
                <option value="Carpentry">Carpentry</option>
                <option value="House Work">House Work</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Photography">Photography</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Electrician">Electrician</option>
              </select>
            </div>

            {/* Zip Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zip Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter zip code"
                value={zipcode}
                onChange={(e) => setZipcode(e.target.value)}
                required
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date (Optional)</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Completion Date (Optional)</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={completionDate}
                  onChange={(e) => setCompletionDate(e.target.value)}
                />
              </div>
            </div>

            {/* Team Size */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Team Size <span className="text-red-500">*</span>
              </h2>
              <div className="flex flex-wrap gap-4" id="teamMembers">
                {Array.from({ length: teamSize }).map((_, index) => (
                  <div key={index} className="team-member flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-gray-500" />
                    </div>
                    <button
                      type="button"
                      onClick={removeTeamMember}
                      className="mt-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div className="team-member flex flex-col items-center">
                  <button
                    type="button"
                    onClick={addTeamMember}
                    className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                  >
                    <Plus className="w-8 h-8 text-gray-500" />
                  </button>
                </div>
              </div>
            </div>

            {/* Budget Range Slider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget Range {!isVolunteer && <span className="text-red-500">*</span>}
              </label>
              <div className="space-y-4">
                <Range
                  values={budgetRange}
                  step={10}
                  min={0}
                  max={10000}
                  onChange={(values) => setBudgetRange(values)}
                  disabled={isVolunteer}
                  renderTrack={({ props, children }) => (
                    <div
                      {...props}
                      className="h-2 bg-gray-200 rounded-full"
                      style={{ ...props.style }}
                    >
                      {children}
                    </div>
                  )}
                  renderThumb={({ props }) => (
                    <div
                      {...props}
                      className="h-6 w-6 bg-blue-500 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      style={{ ...props.style }}
                    />
                  )}
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>${budgetRange[0]}</span>
                  <span>${budgetRange[1]}</span>
                </div>
              </div>
            </div>

            {/* Volunteer Toggle */}
            <div>
              <button
                type="button"
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center gap-2"
                onClick={() => setIsVolunteer(!isVolunteer)}
              >
                {isVolunteer ? 'Add Budget Range' : 'Make This a Volunteer Gig'}
              </button>
            </div>

            {/* Gig Tasks */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gig Tasks (Optional)</label>
              {gigTasks.map((task, index) => (
                <div key={index} className="flex items-center gap-4 mb-2">
                  <input
                    type="text"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter task"
                    value={task}
                    onChange={(e) => updateGigTask(index, e.target.value)}
                  />
                  <button
                    type="button"
                    className="text-red-500 hover:text-red-600 focus:outline-none"
                    onClick={() => removeGigTask(index)}
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2"
                onClick={addGigTask}
              >
                <Plus className="w-5 h-5" /> Add Task
              </button>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags (Optional)</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., urgent, weekend"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image (Optional)</label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 text-gray-400" />
                    <p className="text-sm text-gray-500 mt-2">Click to upload or drag and drop</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Post Gig
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateGig;