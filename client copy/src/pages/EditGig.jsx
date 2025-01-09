import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';

function EditGig() {
  const { gigId } = useParams();
  const navigate = useNavigate();
  const [gig, setGig] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');

  useEffect(() => {
    fetchGig();
    // eslint-disable-next-line
  }, [gigId]);

  const fetchGig = async () => {
    try {
      const res = await axios.get(`/gigs/${gigId}`);
      setGig(res.data.gig);
      setTitle(res.data.gig.title);
      setDescription(res.data.gig.description);
      setPrice(res.data.gig.price);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`/gigs/${gigId}`, {
        title,
        description,
        price
      });
      alert('Gig updated!');
      navigate(`/gigs/${gigId}`);
    } catch (err) {
      console.error(err);
      alert('Error updating gig');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/gigs/${gigId}`);
      alert('Gig deleted!');
      navigate('/mygigs');
    } catch (err) {
      console.error(err);
      alert('Error deleting gig');
    }
  };

  if (!gig) return <div>Loading gig...</div>;

  return (
    <div className="max-w-md mx-auto bg-white p-4 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Edit Gig</h2>
      <div className="mb-2">
        <label className="block font-semibold">Title</label>
        <input
          className="border w-full p-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="mb-2">
        <label className="block font-semibold">Description</label>
        <textarea
          className="border w-full p-2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="mb-2">
        <label className="block font-semibold">Price</label>
        <input
          type="number"
          className="border w-full p-2"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </div>
      <div className="flex space-x-2 mt-4">
        <button
          onClick={handleUpdate}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Update
        </button>
        <button
          onClick={handleDelete}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default EditGig;
