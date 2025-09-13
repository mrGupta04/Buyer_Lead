'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ImportError {
  row: number;
  errors: string[];
}

export default function ImportPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [errors, setErrors] = useState<ImportError[]>([]);
  const [result, setResult] = useState<{ imported: number; skipped: number } | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate file type
      const validTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];

      if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(csv|xlsx|xls)$/i)) {
        setErrors([{ row: 0, errors: ['Please select a valid CSV or Excel file'] }]);
        return;
      }

      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setErrors([{ row: 0, errors: ['File size must be less than 10MB'] }]);
        return;
      }

      setFile(selectedFile);
      setErrors([]);
      setResult(null);
    }
  };
  
  const handleImport = async () => {
    if (!file) return;
    
    setIsImporting(true);
    setErrors([]);
    setResult(null);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      // Show progress indicator
      const importToast = document.createElement('div');
      importToast.innerHTML = `
        <div style="position: fixed; top: 20px; right: 20px; background: #fff; padding: 15px; border-radius: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); z-index: 1000;">
          <p>Importing buyers... Please wait.</p>
        </div>
      `;
      document.body.appendChild(importToast);

      // Send the file to the server
      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData,
      });

      // Remove progress indicator
      document.body.removeChild(importToast);

      const data = await response.json();
      
      if (!response.ok) {
        // Handle validation errors
        if (data.errors && Array.isArray(data.errors)) {
          setErrors(data.errors);
        } else {
          throw new Error(data.error || data.message || 'Failed to import file');
        }
        return;
      }

      setResult({
        imported: data.importedCount || data.imported?.length || 0,
        skipped: data.skippedCount || data.failed?.length || 0,
      });
      
      if (data.failed && data.failed.length > 0) {
        const failedErrors = data.failed.map((error: any) => ({
          row: 0,
          errors: [error.error || 'Failed to import record'],
        }));
        setErrors(prev => [...prev, ...failedErrors]);
      }
      
      // Redirect to buyers list after successful import
      if ((data.importedCount || data.imported?.length || 0) > 0) {
        setTimeout(() => {
          router.push('/buyers');
        }, 3000);
      }
    } catch (error) {
      setErrors([{ row: 0, errors: [error instanceof Error ? error.message : 'Failed to import file'] }]);
    } finally {
      setIsImporting(false);
    }
  };
  
  const downloadTemplate = () => {
    const headers = [
      'fullName', 'email', 'phone', 'city', 'propertyType', 'bhk', 
      'purpose', 'budgetMin', 'budgetMax', 'timeline', 'source', 
      'status', 'notes', 'tags'
    ];
    
    // Add example data
    const exampleData = [
      'John Doe', 'john@example.com', '9876543210', 'Chandigarh', 'Apartment', 'Two',
      'Buy', '500000', '1000000', 'ZeroToThree', 'Website', 'New', 'Interested in 2BHK', 'urgent,premium'
    ];
    
    const csvContent = headers.join(',') + '\n' + exampleData.join(',');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'buyers-import-template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Import Buyers from CSV</h1>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Home
          </button>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="mb-4">
            <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
              CSV/Excel File
            </label>
            <input
              type="file"
              id="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="mt-1 text-sm text-gray-500">
              Maximum 10MB. Download the{' '}
              <button
                type="button"
                onClick={downloadTemplate}
                className="text-blue-600 hover:text-blue-800"
              >
                template CSV
              </button>{' '}
              for reference.
            </p>
          </div>
          
          <button
            type="button"
            onClick={handleImport}
            disabled={!file || isImporting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isImporting ? 'Importing...' : 'Import File'}
          </button>
        </div>
        
        {result && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
            <p className="font-medium">Import completed:</p>
            <p>{result.imported} successful, {result.skipped} skipped</p>
            {result.imported > 0 && (
              <p className="mt-1">Redirecting to buyers list in 3 seconds...</p>
            )}
          </div>
        )}
        
        {errors.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Import Errors</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Row
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Errors
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {errors.map((error, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {error.row || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-red-600">
                        {Array.isArray(error.errors) 
                          ? error.errors.join(', ') 
                          : String(error.errors)
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}