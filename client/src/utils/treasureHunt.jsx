/* === TREASURE HUNT START === */
import { useState } from 'react';

// Custom hook for treasure hunt functionality
export const useTreasureHunt = () => {
  const [firstFound, setFirstFound] = useState(() => 
    localStorage.getItem('treasureHunt.firstFound') === 'true'
  );
  const [secondFound, setSecondFound] = useState(() => 
    localStorage.getItem('treasureHunt.secondFound') === 'true'
  );
  const [completionShown, setCompletionShown] = useState(() => 
    localStorage.getItem('treasureHunt.completionShown') === 'true'
  );
  const [clickCount, setClickCount] = useState(0);

  // Show popup function with SweetAlert2 fallback
  const showPopup = async (title, text) => {
    try {
      // Try to use SweetAlert2 if available
      const { default: Swal } = await import('sweetalert2');
      await Swal.fire({
        title,
        text,
        icon: 'success',
        confirmButtonText: 'Continue Quest!',
        confirmButtonColor: '#10b981'
      });
    } catch (error) {
      // Fallback to regular alert
      alert(`${title}\n\n${text}`);
    }
  };

  // Handle first treasure (footer clicks)
  const handleFirstTreasure = async () => {
    // If both treasures are already found, show the combined popup
    if (firstFound && secondFound) {
      await showPopup(
        '🎉 Treasure Already Cracked!',
        'Combined code: 99111100101  109111110107\n\nBoth treasures have been found! The quest is complete.'
      );
      return;
    }
    
    if (firstFound) return;
    
    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    if (newCount >= 6) {
      localStorage.setItem('treasureHunt.firstFound', 'true');
      setFirstFound(true);
      
      await showPopup(
        '🎉 First Treasure Unlocked!',
        'First code unlocked: 99111100101'
      );
      
      // Check for completion
      if (secondFound && !completionShown) {
        setTimeout(() => showCompletionPopup(), 1500);
      }
    }
  };

  // Handle second treasure (text edit)
  const handleSecondTreasure = async () => {
    // If both treasures are already found, show the combined popup
    if (firstFound && secondFound) {
      await showPopup(
        '🎉 Treasure Already Cracked!',
        'Combined code: 99111100101  109111110107\n\nBoth treasures have been found! The quest is complete.'
      );
      return;
    }
    
    if (secondFound) return;
    
    localStorage.setItem('treasureHunt.secondFound', 'true');
    setSecondFound(true);
    
    await showPopup(
      '💎 Second Treasure Unlocked!',
      'Second code unlocked: 109111110107'
    );
    
    // Check for completion
    if (firstFound && !completionShown) {
      setTimeout(() => showCompletionPopup(), 1500);
    }
  };

  // Show completion popup
  const showCompletionPopup = async () => {
    if (completionShown) return; // Don't show if already shown
    
    localStorage.setItem('treasureHunt.completionShown', 'true');
    setCompletionShown(true);
    
    await showPopup(
      '🎉 Treasure Cracked!',
      'Combined code: 99111100101  109111110107'
    );
  };

  return {
    firstFound,
    secondFound,
    clickCount,
    completionShown,
    handleFirstTreasure,
    handleSecondTreasure
  };
};

// Editable text component for the Team page
export const EditableText = ({ 
  initialText, 
  targetText, 
  onCorrectEdit, 
  isCompleted,
  className = "",
  style = {}
}) => {
  const [text, setText] = useState(initialText);
  const [isEditing, setIsEditing] = useState(false);
  const [hasBeenClicked, setHasBeenClicked] = useState(false);

  const handleClick = () => {
    if (isCompleted) return;
    setHasBeenClicked(true);
    setIsEditing(true);
  };

  const handleChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    
    // Check if the text matches the target (case-insensitive)
    if (newText.toLowerCase() === targetText.toLowerCase()) {
      setIsEditing(false);
      onCorrectEdit();
    }
  };

  const handleBlur = () => {
    if (!isCompleted && text.toLowerCase() !== targetText.toLowerCase()) {
      setText(initialText); // Reset if not completed and not correct
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  };

  return (
    <span 
      className={`inline-block cursor-pointer select-none ${className}`}
      style={{
        ...style,
        backgroundColor: 'transparent',
        padding: '0',
        borderRadius: '0',
        border: 'none',
        minWidth: 'auto'
      }}
      onClick={handleClick}
      title={isCompleted ? 'Second treasure found!' : hasBeenClicked ? 'Keep typing...' : 'Something seems editable here...'}
    >
      {isEditing ? (
        <input
          type="text"
          value={text}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyPress={handleKeyPress}
          autoFocus
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'inherit', // Keep text visible while typing
            font: 'inherit',
            width: 'auto',
            minWidth: '60px',
            textShadow: 'none',
            transition: 'all 0.3s ease'
          }}
        />
      ) : (
        <span style={{ 
          color: isCompleted ? '#10b981' : (hasBeenClicked ? 'white' : 'inherit'),
          fontWeight: isCompleted ? 'bold' : 'inherit',
          textShadow: hasBeenClicked && !isCompleted ? '0 0 8px rgba(255,255,255,0.3)' : 'none',
          transition: 'all 0.3s ease'
        }}>
          {isCompleted ? targetText : text}
          {isCompleted && ' ✨'}
        </span>
      )}
    </span>
  );
};

// Global reset function for testing
if (typeof window !== 'undefined') {
  window.resetTreasureHunt = () => {
    localStorage.removeItem('treasureHunt.firstFound');
    localStorage.removeItem('treasureHunt.secondFound');
    localStorage.removeItem('treasureHunt.completionShown');
    console.log('🗑️ Treasure hunt progress cleared! Refresh the page to start over.');
    if (confirm('Treasure hunt progress cleared! Refresh the page now?')) {
      window.location.reload();
    }
  };
}
/* === TREASURE HUNT END === */
