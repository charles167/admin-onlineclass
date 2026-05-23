import React, { useState, useRef } from 'react';

export const FileUpload = ({ 
  onFileSelect, 
  acceptedFormats = '.pdf,.jpg,.jpeg,.png,.zip,.txt,.doc,.docx',
  maxSize = 10, // MB
  multiple = false 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const validateFile = (file) => {
    const maxSizeBytes = maxSize * 1024 * 1024;
    
    if (file.size > maxSizeBytes) {
      return `File size exceeds ${maxSize}MB limit`;
    }

    const extension = '.' + file.name.split('.').pop().toLowerCase();
    if (!acceptedFormats.includes(extension)) {
      return `File type ${extension} not accepted`;
    }

    return null;
  };

  const handleFiles = (files) => {
    setError('');
    const fileArray = Array.from(files);
    
    // Validate files
    for (const file of fileArray) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    const filesWithPreview = fileArray.map(file => ({
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: URL.createObjectURL(file)
    }));

    if (multiple) {
      setSelectedFiles([...selectedFiles, ...filesWithPreview]);
      onFileSelect && onFileSelect([...selectedFiles, ...filesWithPreview]);
    } else {
      setSelectedFiles(filesWithPreview);
      onFileSelect && onFileSelect(filesWithPreview);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFileSelect && onFileSelect(newFiles);
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    const iconMap = {
      pdf: '📄',
      doc: '📝',
      docx: '📝',
      txt: '📝',
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
      zip: '📦',
      default: '📎'
    };
    return iconMap[extension] || iconMap.default;
  };

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
          dragActive 
            ? 'border-primary-600 bg-primary-100/10 scale-[1.02]' 
            : error 
            ? 'border-red-500 bg-red-50/50' 
            : 'border-gray-300 bg-gray-50 hover:border-primary-600 hover:bg-primary-50/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={acceptedFormats}
          multiple={multiple}
          onChange={handleChange}
        />
        
        <div className="flex flex-col items-center gap-4">
          <div className="text-5xl opacity-60">📤</div>
          <div className="text-center">
            <p className="text-base font-semibold text-gray-900 mb-1">
              {dragActive ? 'Drop files here' : 'Drag & drop files here'}
            </p>
            <p className="text-sm text-gray-600">or click to browse</p>
          </div>
          <div className="flex flex-col gap-1 mt-2">
            <small className="text-xs text-gray-500">Accepted formats: {acceptedFormats.replace(/\./g, ' ')}</small>
            <small className="text-xs text-gray-500">Maximum size: {maxSize}MB per file</small>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 mt-3 bg-red-50 border border-red-500 rounded-lg text-red-600 text-sm">
          <span className="text-lg">⚠️</span>
          {error}
        </div>
      )}

      {selectedFiles.length > 0 && (
        <div className="mt-6 border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 m-0">Selected Files ({selectedFiles.length})</h4>
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {selectedFiles.map((fileObj, index) => (
              <div key={index} className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-b-0 transition-colors hover:bg-gray-50">
                <div className="text-3xl flex-shrink-0">{getFileIcon(fileObj.name)}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 mb-0.5 overflow-hidden text-ellipsis whitespace-nowrap">{fileObj.name}</div>
                  <div className="text-xs text-gray-600">{formatFileSize(fileObj.size)}</div>
                </div>
                <button
                  className="flex-shrink-0 p-1.5 text-lg text-gray-400 rounded transition-all hover:bg-red-50 hover:text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  aria-label="Remove file"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
