import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { Heart } from "lucide-react";
import axiosInstance from '../api/axiosInstance.js';
import toast from 'react-hot-toast';
import { useAuth } from '@clerk/clerk-react';

const Community = () => {
  const [creations, setCreations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  const {getToken} = useAuth();

  const fetchCreations = async () => {
    try {
      const {data} = await axiosInstance.get('/api/user/published-creations', { headers: {
          Authorization: `Bearer ${await getToken()}`
        }
      });

      if (data.success) {
        setCreations(data.creations);
      } else {
        toast.error(data.message || "Error fetching creations. Please try again.");
      }
    } catch (error) {
      console.log(error?.response?.data?.message || error.message);
      toast.error("Error fetching creations.")
    } finally {
      setLoading(false);
    }
  };

  const imageLikeToggle = async (creationId) => {
    try {
      const {data} = await axiosInstance.post('/api/user/toggle-like-creation', 
        {creationId}, 
        { headers: {
            Authorization: `Bearer ${await getToken()}`
          }
        }
      );
      if (data.success) {
        await fetchCreations();
        toast.success(data.message);
      } else {
        toast.error(data.message || "Error toggling like. Please try again.");
      }
    } catch (error) {
      console.log(error?.response?.data?.message || error.message);
      toast.error("Error toggling like.")
    }
  };

  useEffect(() => {
    if (user) {
      fetchCreations();
    }
  }, [user]);

  return !loading ? (
    <div className="flex-1 h-full flex flex-col gap-4 p-6">
      Creations
      <div className="bg-white h-full w-full rounded-xl overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {creations.map((creation, index) => (
          <div
            key={index}
            className="relative group inline-block pl-3 pt-3 w-full sm:max-w-1/2 lg:max-w-1/3">
              <img src={creation.content} alt="image" className="w-full h-full object-cover rounded-lg"/>

              <div className="absolute bottom-0 top-0 right-0 left-3 flex gap-2 items-end justify-end 
                group-hover:justify-between p-3 group-hover:bg-gradient-to-b from-transparent to-black/80
              text-white rounded-lg ">
                <p className="text-sm hidden group-hover:block">{creation.prompt}</p>
                <div className="flex gap-1 items-center">
                  <p>{creation.likes.length}</p>
                  <Heart onClick={() => imageLikeToggle(creation.id)} className={`min-w-5 h-5 hover:scale-110 cursor-pointer
                    ${creation.likes.includes(user.id) 
                    ? 'fill-red-500 text-red-600' 
                    : 'text-white'}`}/>
                </div>
              </div>
            </div>
        ))}
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center h-full">
      <span className="w-10 h-10 my-1 rounded-full border-3 border-primary border-t-transparent animate-spin"></span>
    </div>
  );
};

export default Community;
