import React, { useEffect, useState } from 'react'
import { Gem, Sparkles } from 'lucide-react';
import { Protect } from '@clerk/clerk-react';
import CreationItem from '../components/CreationItem.jsx';
import axiosInstance from '../api/axiosInstance.js';
import toast from 'react-hot-toast';
import { useAuth } from '@clerk/clerk-react';

const Dashboard = () => {

  const [creations, setCreations] = useState([]);
  const [loading, setLoading] = useState(true);

  const {getToken} = useAuth();

  const getDashboardData = async () => {
    try {
      const {data} = await axiosInstance.get('/api/user/creations', {
        headers: {
          Authorization: `Bearer ${await getToken()}`
        }
      });

      if (data.success) {
        setCreations(data.creations);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error?.response?.data?.message || error.message)
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getDashboardData()
  }, [])

  return (
    <div className='h-full overflow-y-scroll p-6'>
      <div className='flex justify-start gap-4 flex-wrap'>

        {/* Total creations card */}

        <div className='flex justify-between items-center w-72 p-4 px-6 bg-white rounded-xl border border-gray-200'>
          <div className='text-slate-600'>
            <p className='text-sm'>Total Creations</p>
            <h2 className='text-xl font-semibold'>{creations.length}</h2>
            </div>
          <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-teal-300 to-teal-700
           text-white flex justify-center items-center'>
            <Sparkles className='w-5 text-white'/>
          </div>
        </div>

         {/* Active plan card */}

        <div className='flex justify-between items-center w-72 p-4 px-6 bg-white rounded-xl border border-gray-200'>
          <div className='text-slate-600'>
            <p className='text-sm'>Ative Plan</p>
            <h2 className='text-xl font-semibold'>
              <Protect plan='Free' fallback='Premium'>
                Free
              </Protect>
            </h2>
            </div>
          <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-teal-300 to-teal-700
           text-white flex justify-center items-center'>
            <Gem className='w-5 text-white'/>
          </div>
        </div>

      </div>

      {
        loading 
        ? (
          <div className='flex justify-center items-center h-3/4'>
            <div className='animate-spin rounded-full h-11 w-11 border-3 border-teal-500 border-t-transparent'></div>
          </div>
        )
        : (
          <div className='space-y-3'>
            <p className='mt-6 mb-4'>Recent Creations</p>
            {
              creations.map((item) => <CreationItem key={item.id} item={item}/>)
            }
          </div>
        )
      }

      

    </div>
  )
}

export default Dashboard