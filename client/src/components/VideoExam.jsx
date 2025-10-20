import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useToast } from '../contexts/ToastContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const VideoExam = ({ exam, studentInfo, onComplete, onCancel }) => {
  const { addToast } = useToast();
  const localStorageKey = `videoExam_${exam._id}_${studentInfo.usn}`;
  
  // Load saved progress from localStorage
  const loadSavedProgress = () => {
    try {
      const saved = localStorage.getItem(localStorageKey);
      if (saved) {
        const data = JSON.parse(saved);
        // Only load if it's the same exam and within last 24 hours
        const savedTime = new Date(data.timestamp);
        const now = new Date();
        const hoursDiff = (now - savedTime) / (1000 * 60 * 60);
        
        if (hoursDiff < 24) {
          return data;
        }
      }
    } catch (error) {
      console.error('Error loading saved progress:', error);
    }
    return null;
  };

  const savedProgress = loadSavedProgress();
  
  const [watchTime, setWatchTime] = useState(savedProgress?.watchTime || 0);
  const [videoDuration, setVideoDuration] = useState(savedProgress?.videoDuration || 0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [startTime] = useState(savedProgress?.startTime ? new Date(savedProgress.startTime) : new Date());
  const [loading, setLoading] = useState(false);
  const [canSubmit, setCanSubmit] = useState(savedProgress?.canSubmit || false);
  const [wasPlayingBeforeHidden, setWasPlayingBeforeHidden] = useState(false);
  const [videoPaused, setVideoPaused] = useState(false);
  const [pauseReason, setPauseReason] = useState('');
  const [videoError, setVideoError] = useState(null);
  const playerRef = useRef(null);
  const intervalRef = useRef(null);

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYouTubeVideoId(exam.videoLink);

  // Handle cancel with localStorage cleanup
  const handleCancel = () => {
    try {
      localStorage.removeItem(localStorageKey);
      console.log('✅ Exam progress cleared from localStorage (Cancel)');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
    onCancel();
  };

  // Save progress to localStorage whenever key data changes
  useEffect(() => {
    const saveProgress = () => {
      try {
        const progressData = {
          examId: exam._id,
          usn: studentInfo.usn,
          studentName: studentInfo.studentName,
          watchTime,
          videoDuration,
          canSubmit,
          startTime: startTime.toISOString(),
          timestamp: new Date().toISOString()
        };
        localStorage.setItem(localStorageKey, JSON.stringify(progressData));
      } catch (error) {
        console.error('Error saving progress:', error);
      }
    };

    // Save every 5 seconds if video is loaded
    if (videoDuration > 0) {
      const saveInterval = setInterval(saveProgress, 5000);
      return () => clearInterval(saveInterval);
    }
  }, [watchTime, videoDuration, canSubmit, exam._id, studentInfo.usn, studentInfo.studentName, startTime, localStorageKey]);

  // Show message if resuming from saved progress
  useEffect(() => {
    if (savedProgress) {
      const completionPercentage = savedProgress.videoDuration > 0 
        ? Math.min(((savedProgress.watchTime / savedProgress.videoDuration) * 100), 100).toFixed(1)
        : 0;
      addToast(`📌 Resuming exam - ${completionPercentage}% completed`, 'info');
    }
  }, []);

  useEffect(() => {
    if (!videoId) {
      setVideoError('Invalid YouTube video link. Please contact administrator.');
      addToast('❌ Invalid video link. Cannot load video.', 'error');
      return;
    }

    // Load YouTube IFrame API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    tag.onerror = () => {
      setVideoError('Failed to load YouTube player. Please check your internet connection.');
      addToast('❌ Failed to load video player. Please refresh the page.', 'error');
    };
    
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      try {
        playerRef.current = new window.YT.Player('youtube-player', {
          height: '100%',
          width: '100%',
          videoId: videoId,
          playerVars: {
            autoplay: 0,
            controls: 1,
            modestbranding: 1,
            rel: 0,
            origin: window.location.origin,
            enablejsapi: 1,
          },
          events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange,
            onError: onPlayerError,
          },
        });
      } catch (error) {
        setVideoError('Failed to initialize video player.');
      }
    };

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Check if can submit based on watch time and duration
  useEffect(() => {
    if (videoDuration > 0 && watchTime > 0) {
      const completion = (watchTime / videoDuration) * 100;
      if (completion >= 80) {
        setCanSubmit(true);
      }
    }
  }, [watchTime, videoDuration]);

  // Tab visibility detection - Pause video on tab change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab is hidden - pause video if playing
        if (playerRef.current && playerRef.current.getPlayerState) {
          try {
            const state = playerRef.current.getPlayerState();
            if (state === window.YT.PlayerState.PLAYING) {
              setWasPlayingBeforeHidden(true);
              setVideoPaused(true);
              setPauseReason('Tab/App switched');
              playerRef.current.pauseVideo();
              addToast('⚠️ Video paused - Tab changed. Return to resume.', 'warning');
            }
          } catch (error) {
            console.error('Error pausing video:', error);
          }
        }
      } else {
        // Tab is visible again - clear paused overlay but don't auto-play
        if (videoPaused && wasPlayingBeforeHidden) {
          // Clear the paused state so user can click resume
          setTimeout(() => {
            setVideoPaused(false);
            setWasPlayingBeforeHidden(false);
            // Don't auto-play, let user click resume button
          }, 500);
        }
      }
    };

    const handleBlur = () => {
      // Window lost focus - pause video
      if (playerRef.current && playerRef.current.getPlayerState) {
        try {
          const state = playerRef.current.getPlayerState();
          if (state === window.YT.PlayerState.PLAYING) {
            setWasPlayingBeforeHidden(true);
            setVideoPaused(true);
            setPauseReason('App/Window switched');
            playerRef.current.pauseVideo();
            addToast('⚠️ Video paused - Please return to continue.', 'warning');
          }
        } catch (error) {
          console.error('Error pausing video:', error);
        }
      }
    };

    const handleFocus = () => {
      // Window gained focus - clear paused overlay after delay
      if (videoPaused && !document.hidden) {
        setTimeout(() => {
          setVideoPaused(false);
        }, 500);
      }
    };

    // Warn before closing/refreshing
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'Video exam is in progress. Your watch time will be saved, but you will need to start over.';
      return e.returnValue;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [videoPaused, addToast]);

  const onPlayerReady = (event) => {
    try {
      const duration = event.target.getDuration();
      if (duration && duration > 0) {
        setVideoDuration(duration);
      } else {
        setVideoError('Unable to get video duration.');
      }
    } catch (error) {
      console.error('Error in onPlayerReady:', error);
      setVideoError('Error loading video information.');
    }
  };

  const onPlayerError = (event) => {
    let errorMessage = 'Video playback error: ';
    
    switch (event.data) {
      case 2:
        errorMessage += 'Invalid video ID or parameters.';
        break;
      case 5:
        errorMessage += 'HTML5 player error.';
        break;
      case 100:
        errorMessage += 'Video not found or private.';
        break;
      case 101:
      case 150:
        errorMessage += 'Video owner does not allow embedding.';
        break;
      default:
        errorMessage += 'Unknown error occurred.';
    }
    
    setVideoError(errorMessage);
    addToast(`❌ ${errorMessage}`, 'error');
  };

  const onPlayerStateChange = (event) => {
    try {
      if (event.data === window.YT.PlayerState.PLAYING) {
        setIsPlaying(true);
        setVideoPaused(false);
        startTracking();
        
        if (wasPlayingBeforeHidden) {
          setWasPlayingBeforeHidden(false);
        }
      } else if (event.data === window.YT.PlayerState.PAUSED) {
        setIsPlaying(false);
        stopTracking();
      } else if (event.data === window.YT.PlayerState.ENDED) {
        // Video ended - automatically enable submit
        setIsPlaying(false);
        stopTracking();
        setCanSubmit(true);
        addToast('✅ Video completed! You can now submit.', 'success');
      } else {
        setIsPlaying(false);
        stopTracking();
      }
    } catch (error) {
      console.error('Error in onPlayerStateChange:', error);
    }
  };

  const startTracking = () => {
    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setWatchTime((prev) => {
          const newTime = prev + 1;
          
          // Get actual video duration from player if available
          let duration = videoDuration;
          if (playerRef.current && playerRef.current.getDuration) {
            duration = playerRef.current.getDuration();
            if (duration && duration !== videoDuration) {
              setVideoDuration(duration);
            }
          }
          
          // Enable submit when 80% watched or more
          if (duration > 0 && (newTime / duration) >= 0.8) {
            setCanSubmit(true);
          }
          
          return newTime;
        });
      }, 1000);
    }
  };

  const stopTracking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      const currentCompletion = videoDuration > 0 
        ? ((watchTime / videoDuration) * 100).toFixed(1)
        : 0;
      
      addToast(`⚠️ Please watch at least 80% of the video. Current: ${currentCompletion}%`, 'warning');
      return;
    }

    if (!window.confirm('✓ Are you sure you want to submit? Your watch time will be recorded.')) {
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/exams/submit-video`, {
        examId: exam._id,
        studentName: studentInfo.studentName,
        usn: studentInfo.usn,
        watchTime,
        totalVideoDuration: videoDuration,
        startedAt: startTime.toISOString(),
        submittedAt: new Date().toISOString()
      });

      const completionPercentage = response.data.data.completionPercentage;
      
      // Clear localStorage after successful submission
      try {
        localStorage.removeItem(localStorageKey);
        console.log('✅ Exam progress cleared from localStorage');
      } catch (error) {
        console.error('Error clearing localStorage:', error);
      }
      
      addToast(`✅ Video exam submitted! Completion: ${completionPercentage}%`, 'success');
      
      onComplete(response.data.data);
    } catch (error) {
      console.error('Submission error:', error);
      
      let errorMessage = 'Failed to submit video exam. ';
      
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage += error.response.data.message || 'Invalid submission data.';
        } else if (error.response.status === 404) {
          errorMessage += 'Exam not found.';
        } else if (error.response.status === 500) {
          errorMessage += 'Server error. Please try again.';
        } else {
          errorMessage += error.response.data.message || 'Unknown error occurred.';
        }
      } else if (error.request) {
        errorMessage += 'Network error. Please check your internet connection.';
      } else {
        errorMessage += error.message || 'Unexpected error occurred.';
      }
      
      addToast(`❌ ${errorMessage}`, 'error');
      setLoading(false);
    }
  };

  const completionPercentage = videoDuration > 0 
    ? Math.min(((watchTime / videoDuration) * 100), 100).toFixed(1)
    : 0;

  return (
    <>
      <style>{`
        #youtube-player iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100% !important;
          height: 100% !important;
        }
      `}</style>
      <div className="min-h-screen bg-gray-50 p-2 sm:p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
        {/* Video Error Banner */}
        {videoError && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-bold">Video Error</p>
                <p className="text-sm">{videoError}</p>
                <p className="text-xs mt-1">Please contact administrator or try refreshing the page.</p>
              </div>
            </div>
          </div>
        )}

        {/* Video Paused Banner */}
        {videoPaused && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-lg mb-6 animate-pulse">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-bold">⏸️ Video Paused</p>
                <p className="text-sm">Reason: {pauseReason}</p>
                <p className="text-xs mt-1">Click the play button on the video to resume watching. Watch time tracking is paused.</p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{exam.examName}</h1>
              <p className="text-gray-600">{studentInfo.studentName} ({studentInfo.usn})</p>
            </div>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Video Player */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <div 
              id="youtube-player" 
              className="absolute top-0 left-0 w-full h-full"
            ></div>
            
            {/* Resume Overlay */}
            {videoPaused && (
              <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-10">
                <div className="text-center text-white p-8 max-w-md">
                  <svg className="w-20 h-20 mx-auto mb-4 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-2xl font-bold mb-2">Video Paused</p>
                  <p className="text-base sm:text-lg mb-6 text-gray-300">{pauseReason}</p>
                  <button
                    onClick={() => {
                      if (playerRef.current) {
                        try {
                          // Clear all pause states
                          setVideoPaused(false);
                          setWasPlayingBeforeHidden(false);
                          
                          // Ensure player is ready and play
                          if (playerRef.current.playVideo) {
                            playerRef.current.playVideo();
                          }
                        } catch (error) {
                          console.error('Error resuming video:', error);
                          // Fallback: just clear the overlay
                          setVideoPaused(false);
                        }
                      }
                    }}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-lg transition-all duration-200 flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl active:scale-95"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    Click to Resume
                  </button>
                  <p className="text-xs text-gray-400 mt-4">Tap the button above to continue watching</p>
                </div>
              </div>
            )}
          </div>

          {/* Video Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 bg-blue-50 rounded-lg text-center">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Watch Time</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-600">{formatTime(watchTime)}</p>
            </div>
            <div className="p-3 sm:p-4 bg-purple-50 rounded-lg text-center">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Completion</p>
              <p className="text-xl sm:text-2xl font-bold text-purple-600">{completionPercentage}%</p>
            </div>
            <div className="p-3 sm:p-4 bg-green-50 rounded-lg text-center">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Video Duration</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600">{formatTime(videoDuration)}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${
                  parseFloat(completionPercentage) >= 80 ? 'bg-green-600' : 'bg-blue-600'
                }`}
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {parseFloat(completionPercentage) >= 80 
                ? '✓ You can now submit the exam' 
                : 'Watch at least 80% to submit'}
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-3 sm:p-4 md:p-6 mb-4 sm:mb-6">
          <h3 className="font-semibold text-yellow-800 mb-2 text-sm sm:text-base">Instructions:</h3>
          <ul className="list-disc list-inside space-y-1 text-yellow-700 text-xs sm:text-sm">
            <li>Watch the video carefully</li>
            <li>Your watch time is being tracked</li>
            <li>You must watch at least 80% to submit</li>
            <li>Do not close or refresh this page</li>
            <li>The system tracks actual video playback time</li>
          </ul>
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || loading}
            className={`px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg transition w-full sm:w-auto ${
              canSubmit
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {loading ? 'Submitting...' : canSubmit ? 'Submit Exam' : 'Complete Video to Submit'}
          </button>
        </div>

        {/* Status Indicator */}
        <div className="mt-4 sm:mt-6 text-center">
          <div className={`inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-sm sm:text-base ${
            isPlaying ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isPlaying ? 'bg-green-600 animate-pulse' : 'bg-gray-400'
            }`}></div>
            <span className="font-medium">
              {isPlaying ? 'Tracking Active' : 'Tracking Paused'}
            </span>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default VideoExam;
