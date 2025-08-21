import { useToast } from '../contexts/ToastContext';

const Toast = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full sm:max-w-md">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`bg-white rounded-lg shadow-lg overflow-hidden animate-in slide-in-from-right duration-300 ${
            toast.type === 'success' ? 'border-l-4 border-l-green-500' :
            toast.type === 'error' ? 'border-l-4 border-l-red-500' :
            toast.type === 'warning' ? 'border-l-4 border-l-yellow-500' :
            'border-l-4 border-l-blue-600'
          }`}
        >
          <div className="flex items-start justify-between p-4 gap-2">
            <span className="text-gray-800 text-sm leading-relaxed flex-1">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors text-xl leading-none flex-shrink-0"
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Toast;
