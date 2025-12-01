import { useState, useEffect, useRef, useMemo } from 'react';
import ApperIcon from '@/components/ApperIcon';

const ApperFileFieldComponent = ({ elementId, config }) => {
  // State management for UI-driven values
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  
  // Refs for tracking lifecycle and preventing memory leaks
  const mountedRef = useRef(false);
  const elementIdRef = useRef(elementId);
  const existingFilesRef = useRef([]);

  // Update elementIdRef when elementId changes
  useEffect(() => {
    elementIdRef.current = elementId;
  }, [elementId]);

  // Memoize existingFiles to prevent unnecessary re-renders
  const memoizedExistingFiles = useMemo(() => {
    const files = config.existingFiles || [];
    
    // Return empty array if no files
    if (!files || files.length === 0) {
      return [];
    }
    
    // Check if this is actually different from what we had before
    const currentRef = existingFilesRef.current;
    if (currentRef.length === files.length && files.length > 0) {
      // Compare first file's ID/id to detect changes
      const currentId = currentRef[0]?.Id || currentRef[0]?.id;
      const newId = files[0]?.Id || files[0]?.id;
      if (currentId === newId) {
        return currentRef; // Return same reference if no actual change
      }
    }
    
    return files;
  }, [config.existingFiles?.length, config.existingFiles?.[0]?.Id || config.existingFiles?.[0]?.id]);

  // Initial Mount Effect - Initialize SDK and mount component
  useEffect(() => {
    let mounted = true;
    
    const initializeSDK = async () => {
      try {
        // Wait for ApperSDK to be available (max 50 attempts × 100ms = 5 seconds)
        let attempts = 0;
        const maxAttempts = 50;
        
        while (!window.ApperSDK && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
        
        if (!window.ApperSDK) {
          throw new Error('ApperSDK not loaded. Please ensure the SDK script is included before this component.');
        }
        
        const { ApperFileUploader } = window.ApperSDK;
        
        if (!mounted) return; // Component was unmounted during waiting
        
        // Set element ID for SDK
        elementIdRef.current = `file-uploader-${elementId}`;
        
        // Mount the file field with full config
        await ApperFileUploader.FileField.mount(elementIdRef.current, {
          ...config,
          existingFiles: memoizedExistingFiles
        });
        
        if (mounted) {
          mountedRef.current = true;
          setIsReady(true);
          setError(null);
        }
        
      } catch (err) {
        console.error('Failed to initialize ApperFileFieldComponent:', err);
        if (mounted) {
          setError(err.message);
          setIsReady(false);
        }
      }
    };
    
    initializeSDK();
    
    // Cleanup on component destruction
    return () => {
      mounted = false;
      if (window.ApperSDK && mountedRef.current) {
        try {
          const { ApperFileUploader } = window.ApperSDK;
          ApperFileUploader.FileField.unmount(elementIdRef.current);
        } catch (err) {
          console.error('Error unmounting file field:', err);
        }
      }
      mountedRef.current = false;
      setIsReady(false);
    };
  }, [elementId, config.fieldKey, config.tableName, config.apperProjectId, config.apperPublicKey]);

  // File Update Effect - Handle changes to existingFiles
  useEffect(() => {
    if (!isReady || !window.ApperSDK || !config.fieldKey) {
      return;
    }
    
    try {
      const { ApperFileUploader } = window.ApperSDK;
      
      // Deep equality check with current ref
      const currentFiles = existingFilesRef.current;
      const newFiles = memoizedExistingFiles;
      
      // Compare using JSON stringify for deep equality
      if (JSON.stringify(currentFiles) === JSON.stringify(newFiles)) {
        return; // No actual change
      }
      
      // Update the ref
      existingFilesRef.current = newFiles;
      
      // Detect format and convert if needed
      let filesToUpdate = newFiles;
      if (newFiles.length > 0 && newFiles[0].hasOwnProperty('Id')) {
        // Convert from API format to UI format
        filesToUpdate = ApperFileUploader.toUIFormat(newFiles);
      }
      
      // Update files or clear field based on length
      if (filesToUpdate.length > 0) {
        ApperFileUploader.FileField.updateFiles(config.fieldKey, filesToUpdate);
      } else {
        ApperFileUploader.FileField.clearField(config.fieldKey);
      }
      
    } catch (err) {
      console.error('Error updating files:', err);
      setError(`Failed to update files: ${err.message}`);
    }
  }, [memoizedExistingFiles, isReady, config.fieldKey]);

  // Error UI
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center space-x-2 text-red-700">
          <ApperIcon name="AlertCircle" className="w-5 h-5" />
          <p className="text-sm font-medium">File Upload Error</p>
        </div>
        <p className="mt-1 text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Main container with unique ID for SDK */}
      <div id={elementIdRef.current} className="min-h-[120px] w-full">
        {/* Loading UI */}
        {!isReady && (
          <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
            <div className="text-center">
              <ApperIcon name="Upload" className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Initializing file uploader...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApperFileFieldComponent;