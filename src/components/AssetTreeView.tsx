import React, { useState } from 'react';
import { ChevronRight, ChevronDown, FolderTree, Building, Store } from 'lucide-react';
import { Asset } from '../types/asset';

interface TreeNode {
  name: string;
  children: { [key: string]: TreeNode };
  assets: Asset[];
  totalAssets?: number;
  isExpanded?: boolean;
  path?: string;
}

interface AssetTreeViewProps {
  assets: Asset[];
  onNodeSelect: (node: { path: string, assets: Asset[] }) => void;
}

const AssetTreeView: React.FC<AssetTreeViewProps> = ({ assets, onNodeSelect }) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const buildTree = (assets: Asset[]): TreeNode => {
    const root: TreeNode = { name: 'root', children: {}, assets: [], path: '' };
    
    // Helper function to calculate total assets in a node and its children
    const calculateTotalAssets = (node: TreeNode): number => {
      let total = node.assets.length;
      Object.values(node.children).forEach(child => {
        total += calculateTotalAssets(child);
      });
      node.totalAssets = total;
      return total;
    };
    
    // Create a map to track unnamed asset counts per floor
    const unnamedCounts: Record<string, number> = {};
    
    assets.forEach(asset => {
      let currentNode = root;
      
      // Create system node with validation
      const system = asset.system?.trim() || 'Uncategorized System';
      if (!currentNode.children[system]) {
        currentNode.children[system] = { 
          name: system, 
          children: {}, 
          assets: [],
          path: `/system:${system}` 
        };
      }
      currentNode = currentNode.children[system];
      
      // Create sub-system node with validation
      const subSystem = asset.subSystem?.trim() || 'Uncategorized Sub-System';
      if (!currentNode.children[subSystem]) {
        currentNode.children[subSystem] = { 
          name: subSystem, 
          children: {}, 
          assets: [],
          path: `/system:${system}/subsystem:${subSystem}`
        };
      }
      currentNode = currentNode.children[subSystem];
      
      // Create floor node with validation
      const floor = asset.floor?.trim() || 'Uncategorized Floor';
      if (!currentNode.children[floor]) {
        currentNode.children[floor] = { 
          name: floor, 
          children: {}, 
          assets: [],
          path: `/system:${system}/subsystem:${subSystem}/floor:${floor}`
        };
        unnamedCounts[`${system}/${subSystem}/${floor}`] = 0;
      }
      currentNode = currentNode.children[floor];
      
      // Add asset to floor node - handle unnamed assets
      const floorKey = `${system}/${subSystem}/${floor}`;
      let assetName = asset.name?.trim() || '';
      
      if (!assetName) {
        unnamedCounts[floorKey] = (unnamedCounts[floorKey] || 0) + 1;
        assetName = `Unnamed Asset #${unnamedCounts[floorKey]}`;
      }
      
      currentNode.assets.push({
        ...asset,
        name: assetName
      });
    });
    
    // Calculate total assets for each node
    calculateTotalAssets(root);
    
    return root;
  };

  const toggleNode = (path: string, node: TreeNode) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
    
    // Set as selected node and pass to parent for filtering
    setSelectedNode(path);
    setSelectedAsset(null);
    
    // Collect all assets from this node and its children
    const collectAssets = (node: TreeNode): Asset[] => {
      let allAssets = [...node.assets];
      Object.values(node.children).forEach(child => {
        allAssets = allAssets.concat(collectAssets(child));
      });
      return allAssets;
    };
    
    onNodeSelect({
      path,
      assets: collectAssets(node)
    });
  };

  const selectAsset = (asset: Asset, path: string) => {
    setSelectedAsset(asset);
    setSelectedNode(null);
    
    // Pass only this asset to the parent for filtering
    onNodeSelect({
      path: `${path}/asset:${asset.assetId || asset.name}`,
      assets: [asset]
    });
  };

  const getNodeIcon = (nodeName: string, level: number) => {
    if (level === 0) return <Building className="w-4 h-4 text-teal-500 mr-1" />;
    if (level === 1) return <Store className="w-4 h-4 text-blue-500 mr-1" />;
    return null;
  };

  const renderNode = (node: TreeNode, path: string = '', level: number = 0) => {
    const isExpanded = expandedNodes.has(path);
    const isSelected = selectedNode === path;
    const hasChildren = Object.keys(node.children).length > 0 || node.assets.length > 0;
    
    const sortNodes = (entries: [string, TreeNode][]): [string, TreeNode][] => {
      return entries.sort(([keyA, nodeA], [keyB, nodeB]) => {
        const isUncatA = keyA.includes('Uncategorized');
        const isUncatB = keyB.includes('Uncategorized');
        if (isUncatA && !isUncatB) return 1;
        if (!isUncatA && isUncatB) return -1;
        return keyA.localeCompare(keyB);
      });
    };
    
    // Sort assets - named assets first, unnamed assets last
    const sortAssets = (assets: Asset[]): Asset[] => {
      return [...assets].sort((a, b) => {
        const isUnnamedA = a.name.startsWith('Unnamed Asset');
        const isUnnamedB = b.name.startsWith('Unnamed Asset');
        
        if (isUnnamedA && !isUnnamedB) return 1; // Unnamed assets go to the end
        if (!isUnnamedA && isUnnamedB) return -1; // Named assets go to the beginning
        
        // If both are unnamed or both are named, sort alphabetically
        return a.name.localeCompare(b.name);
      });
    };
    
    if (node.name === 'root') {
      return (
        <div className="space-y-1">
          {sortNodes(Object.entries(node.children)).map(([key, child]) => 
            renderNode(child, child.path || `${path}/${key}`, level)
          )}
        </div>
      );
    }

    return (
      <div key={path} className="select-none">
        <div
          className={`flex items-center py-1 px-2 rounded-md transition-colors ${
            isSelected 
              ? 'bg-teal-100 text-teal-800 font-medium' 
              : isExpanded 
                ? 'bg-teal-50 text-teal-700' 
                : 'hover:bg-gray-100'
          } cursor-pointer`}
          style={{ paddingLeft: `${level * 20}px` }}
          onClick={() => toggleNode(path, node)}
        >
          <div className="flex items-center min-w-[24px]">
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500 mr-1" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500 mr-1" />
              )
            ) : <span className="w-4 mr-1" />}
            {getNodeIcon(node.name, level)}
          </div>
          <span className={`text-sm font-medium ${
            node.name.includes('Uncategorized') 
              ? 'text-gray-400 italic' 
              : level === 0 
                ? 'text-teal-700' 
                : level === 1 
                  ? 'text-blue-700' 
                  : 'text-gray-700'
          }`}>{node.name}</span>
          {(node.totalAssets ?? 0) > 0 && (
            <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
              {node.totalAssets}
            </span>
          )}
        </div>
        
        {isExpanded && (
          <div className="ml-4">
            {sortNodes(Object.entries(node.children)).map(([key, child]) =>
              renderNode(child, child.path || `${path}/${key}`, level + 1)
            )}
            {node.assets.length > 0 && (
              <div className="border-l-2 border-gray-200 ml-2 pl-2 mt-1">
                {sortAssets(node.assets).map((asset, index) => (
                  <div
                    key={index}
                    className={`flex items-center py-1.5 px-2 text-sm hover:bg-gray-50 rounded-md transition-colors ${
                      selectedAsset === asset ? 'bg-blue-50 text-blue-700 font-medium' : ''
                    }`}
                    style={{ paddingLeft: `${(level + 1) * 20}px` }}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering parent node's click
                      selectAsset(asset, path);
                    }}
                  >
                    <span className={asset.name.startsWith('Unnamed Asset') ? 'italic text-gray-500' : 'text-gray-600'}>
                      {asset.name}
                      {asset.name.startsWith('Unnamed Asset') ? (
                        <span className="text-gray-400 ml-1">
                          (ID: {asset.assetId || 'Missing ID'})
                        </span>
                      ) : (
                        asset.assetId && (
                          <span className="text-gray-400 ml-1">
                            (ID: {asset.assetId})
                          </span>
                        )
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const tree = buildTree(assets);

  return (
    <div className="border border-gray-200 rounded-lg shadow-sm bg-white/70 backdrop-blur-sm h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-gray-50/80">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <FolderTree className="w-5 h-5 text-teal-500 mr-2" />
          Asset Hierarchy
        </h3>
      </div>
      <div className="overflow-auto flex-grow p-4" style={{ maxHeight: "calc(600px - 56px)" }}>
        {renderNode(tree)}
      </div>
    </div>
  );
};

export default AssetTreeView;