import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, RotateCcw, Info } from 'lucide-react';
import AssetTreeView from './AssetTreeView';
import * as XLSX from 'xlsx';
import { Asset } from '../types/asset';

interface ColumnMapping {
  system: string;
  subSystem: string;
  floor: string;
  name: string;
  assetId: string;
}

const AssetUploader: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [filteredRows, setFilteredRows] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({
    system: '',
    subSystem: '',
    floor: '',
    name: '',
    assetId: ''
  });
  const [rawData, setRawData] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const processExcel = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length > 0) {
          const headers = jsonData[0] as string[];
          setHeaders(headers);
          const rows = jsonData.slice(1).map((row: any) => {
            const rowData: any = {};
            headers.forEach((header, index) => {
              rowData[header] = row[index];
            });
            return rowData;
          });
          setRawData(rows);
          setFilteredRows(rows);
          
          // Convert data to assets after mapping
          const mappedData = jsonData.slice(1).map((row: any) => {
            const asset: any = {};
            headers.forEach((header, index) => {
              const value = row[index];
              if (mapping.system === header) asset.system = value;
              if (mapping.subSystem === header) asset.subSystem = value;
              if (mapping.floor === header) asset.floor = value;
              if (mapping.name === header) asset.name = value;
              if (mapping.assetId === header) asset.assetId = value;
            });
            return asset;
          });

          setAssets(mappedData);
          setFilteredAssets(mappedData);
        }
        setError('');
      } catch (err) {
        setError('Error processing file. Please check the format.');
      }
    };
    reader.onerror = () => {
      setError('Error reading file');
    };
    reader.readAsBinaryString(file);
  }, [mapping]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file?.type.includes('sheet') || file?.name.endsWith('.xlsx')) {
      processExcel(file);
    } else {
      setError('Please upload a valid Excel file');
    }
  }, [processExcel]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false
  });

  const handleMappingChange = (field: keyof ColumnMapping, value: string) => {
    setMapping(prev => ({ ...prev, [field]: value }));
    
    // Create new mapping with updated field
    const newMapping = { ...mapping, [field]: value };
    
    // Update assets with new mapping
    const mappedData = rawData.map(row => ({
      system: row[newMapping.system] || '',
      subSystem: row[newMapping.subSystem] || '',
      floor: row[newMapping.floor] || '',
      name: row[newMapping.name] || '',
      assetId: row[newMapping.assetId] || ''
    }));
    
    setAssets(mappedData);
    setFilteredAssets(mappedData);
    setFilteredRows(rawData);
    setActiveFilter(null);
  };

  const handleNodeSelect = ({ path, assets }: { path: string, assets: Asset[] }) => {
    // Filter the raw data table based on selected assets
    setFilteredAssets(assets);
    setActiveFilter(path);
    
    // Find matching rows in raw data based on asset properties
    const findMatchingRows = () => {
      if (assets.length === 0) {
        return rawData;
      }
      
      return rawData.filter(row => {
        // Check if this row matches any of the filtered assets based on mapped columns
        return assets.some(asset => {
          // Match based on the mapped columns (system, subSystem, floor, name, assetId)
          const rowAssetId = mapping.assetId ? row[mapping.assetId] : undefined;
          const rowName = mapping.name ? row[mapping.name] : undefined;
          const rowSystem = mapping.system ? row[mapping.system] : undefined;
          const rowSubSystem = mapping.subSystem ? row[mapping.subSystem] : undefined;
          const rowFloor = mapping.floor ? row[mapping.floor] : undefined;
          
          // First try to match by assetId if both have it
          if (asset.assetId && rowAssetId) {
            return asset.assetId.toString() === rowAssetId.toString();
          }
          
          // Match by combination of name, system, subsystem and floor if available
          let nameMatches = !mapping.name || !asset.name || 
                           (rowName && asset.name.toString() === rowName.toString());
          
          let systemMatches = !mapping.system || !asset.system || 
                             (rowSystem && asset.system.toString() === rowSystem.toString());
          
          let subSystemMatches = !mapping.subSystem || !asset.subSystem || 
                                (rowSubSystem && asset.subSystem.toString() === rowSubSystem.toString());
          
          let floorMatches = !mapping.floor || !asset.floor || 
                            (rowFloor && asset.floor.toString() === rowFloor.toString());
          
          return nameMatches && systemMatches && subSystemMatches && floorMatches;
        });
      });
    };
    
    setFilteredRows(findMatchingRows());
  };

  const clearFilters = () => {
    setFilteredAssets(assets);
    setFilteredRows(rawData);
    setActiveFilter(null);
  };

  const renderMappingSelect = (field: keyof ColumnMapping, label: string) => (
    <div className="flex flex-col space-y-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <select
        value={mapping[field]}
        onChange={(e) => handleMappingChange(field, e.target.value)}
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md bg-white/80 shadow-sm"
      >
        <option value="">Select column</option>
        {headers.map((header) => (
          <option key={header} value={header}>
            {header}
          </option>
        ))}
      </select>
    </div>
  );

  const renderColumnMapping = () => (
    <div className="bg-white/70 backdrop-blur-sm p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <FileSpreadsheet className="w-5 h-5 text-teal-500 mr-2" />
        Map Excel Columns
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {renderMappingSelect('system', 'System')}
        {renderMappingSelect('subSystem', 'Sub-System')}
        {renderMappingSelect('floor', 'Floor')}
        {renderMappingSelect('name', 'Asset / Equipment / Nick Name')}
        {renderMappingSelect('assetId', 'BIM/Asset ID')}
      </div>
    </div>
  );

  const renderAssetSchema = (row: any) => {
    // Only render if we have exactly one asset selected
    if (!row || !headers?.length) return null;
    
    return (
      <div className="p-6">
        <div className="mb-6 flex items-center">
          <Info className="w-5 h-5 text-teal-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800">Asset Details</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {headers.map((header) => (
            <div key={header} className="border-b border-gray-100 pb-3">
              <p className="text-sm font-medium text-gray-500">{header}</p>
              <p className="text-base text-gray-900 mt-1">{row[header]?.toString() || '-'}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full py-4">
      <div className="flex justify-center mb-6">
        <div
          {...getRootProps()}
          className={`flex items-center w-full px-6 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 ${
            isDragActive 
              ? 'border-teal-400 bg-teal-50/80' 
              : 'border-gray-300 hover:border-teal-400 hover:bg-gray-50/80'
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col sm:flex-row items-center justify-center w-full">
            <Upload className="w-6 h-6 text-teal-500 mr-3 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-700">
                Drag Excel file or <span className="text-teal-600">click to browse</span>
              </p>
              <p className="text-xs text-gray-500">Supports .xlsx, .xls formats</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50/80 backdrop-blur-sm rounded-lg flex items-center text-red-700 border border-red-200">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {headers.length > 0 && (
        <div className="mt-4 p-3 bg-green-50/80 backdrop-blur-sm rounded-lg flex items-center text-green-700 border border-green-200 mb-6">
          <CheckCircle2 className="w-5 h-5 mr-2 flex-shrink-0" />
          <span>Excel file uploaded successfully. Please map the columns below.</span>
        </div>
      )}

      {headers.length > 0 && renderColumnMapping()}

      {assets.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-2">
            <h2 className="text-xl font-semibold flex items-center text-gray-800">
              <FileSpreadsheet className="w-6 h-6 text-teal-500 mr-2" />
              Uploaded Assets ({assets.length})
            </h2>
            
            {activeFilter && (
              <button 
                onClick={clearFilters}
                className="flex items-center px-3 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-50 text-gray-600 transition-colors duration-200"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Clear Filters
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <AssetTreeView 
              assets={assets}
              onNodeSelect={handleNodeSelect}
            />
            <div className="border border-gray-200 rounded-lg shadow-sm bg-white/70 backdrop-blur-sm h-full flex flex-col">
              <div className="p-4 border-b border-gray-200 bg-gray-50/80">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <FileSpreadsheet className="w-5 h-5 text-teal-500 mr-2" />
                  Asset Details
                  {activeFilter && filteredRows.length !== rawData.length && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      {filteredRows.length} of {rawData.length}
                    </span>
                  )}
                </h3>
              </div>
              
              <div className="overflow-auto flex-grow" style={{ maxHeight: "calc(600px - 56px)" }}>
                {filteredAssets.length === 1 ? (
                  // Schema view for single asset
                  renderAssetSchema(filteredRows[0])
                ) : (
                  // Table view for multiple assets
                  <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50/80 backdrop-blur-sm sticky top-0 z-10">
                      <tr>
                        {headers.map((header) => (
                          <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white/70 backdrop-blur-sm divide-y divide-gray-200">
                      {filteredRows.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50/80">
                          {headers.map((header, i) => (
                            <td key={i} className="px-6 py-4 text-sm text-gray-700 truncate max-w-xs">
                              {row[header]?.toString() || ''}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetUploader;