import React, { useState } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

// Import ShadCN UI components
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

function CreateGig() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState(null);
  const [zipcode, setZipcode] = useState('');            // New state for zipcode
  const [file, setFile] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('category_id', categoryId);
      formData.append('zipcode', zipcode);              // Append zipcode to form data
      if (file) {
        formData.append('gigImage', file);
      }
      await axios.post('/gigs', formData);
      alert('Gig created!');
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Error creating gig');
    }
  };

  const categoryOptions = [
    { id: 1, name: 'Music' },
    { id: 2, name: 'Carpentry' },
    { id: 3, name: 'House Work' },
    { id: 4, name: 'Cleaning' },
    { id: 5, name: 'Photography' },
    { id: 6, name: 'Plumbing' },
    { id: 7, name: 'Electrician' },
  ];

  return (
    <div className="flex justify-center items-center p-4">
      <Card className="w-full max-w-lg">
        <CardContent>
          <CardTitle className="text-2xl font-bold mb-4 text-center">Create Gig</CardTitle>
          
          <div className="space-y-4">
            {/* Title */}
            <div>
              <Label htmlFor="title" className="block mb-1 font-semibold">Title</Label>
              <Input
                id="title"
                placeholder="Enter gig title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="block mb-1 font-semibold">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your gig..."
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Price */}
            <div>
              <Label htmlFor="price" className="block mb-1 font-semibold">Price ($)</Label>
              <Input
                id="price"
                type="number"
                placeholder="Enter price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category_id" className="block mb-1 font-semibold">Category</Label>
              <Select value={categoryId} onValueChange={(value) => setCategoryId(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Zipcode */}
            <div>
              <Label htmlFor="zipcode" className="block mb-1 font-semibold">Zip Code (optional)</Label>
              <Input
                id="zipcode"
                placeholder="Enter zip code"
                value={zipcode}
                onChange={(e) => setZipcode(e.target.value)}
              />
            </div>

            {/* File Upload */}
            <div>
              <Label htmlFor="gigImage" className="block mb-1 font-semibold">Gig Image (optional)</Label>
              <Input
                id="gigImage"
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button onClick={handleSubmit} className="w-full">Submit</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CreateGig;
