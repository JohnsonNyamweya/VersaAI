import { FileText, Sparkles } from "lucide-react";
import React, {useState} from "react";
import toast from 'react-hot-toast';
import axiosInstance from '../api/axiosInstance.js';
import { useAuth } from '@clerk/clerk-react';
import Markdown from "react-markdown";

const ReviewResume = () => {
  const [input, setInput]  = useState('');
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
 
  const {getToken} = useAuth();

  const onSubmitHandler = async (e) => {
      e.preventDefault();

      try {
        setLoading(true);

        const formData = new FormData();
        formData.append('resume', input);
        const {data} = await axiosInstance.post('/api/ai/resume-review', formData, { headers: {
            Authorization: `Bearer ${await getToken()}`
          }
        });

        if (data.success) {
          setContent(data.content);
          toast.success("Resume reviewed successfully!");
        } else {
          toast.error(data.message || "Error reviewing resume. Please try again.");
        }
      } catch (error) {
        console.log(error?.response?.data?.message || error.message);
        toast.error("Error reviewing resume.")
      } finally {
        setLoading(false);
      }
    }


  return (
    <div
      className="h-full overflow-y-scroll p-6 flex items-start flex-wrap 
    gap-4 text-slate-700"
    >
      {/* Left Column */}
      <form onSubmit={onSubmitHandler} className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 text-teal-700" />
          <h1 className="text-xl font-semibold">Resume Review</h1>
        </div>
        <p className="mt-6 font-medium text-sm">Upload Resume</p>
        <input
          onChange={(e) => setInput(e.target.files[0])}
          type="file"
          accept='application/pdf'
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md 
          border border-gray-300 text-gray-600"
          required
        />
        <p className='text-sm text-gray-500 font-light mt-1'>Supports PDF Resume only.</p>
        <button disabled={loading} className="w-full flex justify-center items-center gap-2 
        bg-gradient-to-r from-teal-300 to-teal-700 text-white px-4 
        py-2 mt-6 text-sm rounded-lg cursor-pointer">
          {loading
            ? <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin"></span>
            : <FileText className="w-5"/>
          }
          Review Resume
        </button>
      </form>
      {/* Right Column */}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col 
      border border-gray-200 min-h-96 max-h-[600px]">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-teal-300"/>
          <h1 className="text-xl font-semibold">Analysis Results</h1>
        </div>

        {!content
        ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
              <FileText className="w-9 h-9"/>
              <p>Upload a resume and click "Review Resume" to get started.</p>
            </div>
          </div>
        )
        : (
          <div className="mt-3 h-full">
              <div className="reset-tw">
                <Markdown>{content}</Markdown>
              </div>
            </div>
        )

        }
        
      </div>
    </div>
  )
};

export default ReviewResume;
