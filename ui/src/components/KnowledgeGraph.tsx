"use client";
import React, { useEffect, useRef, useState } from 'react';
import cytoscape, { Core, EdgeSingular, NodeSingular } from 'cytoscape';
import cola from 'cytoscape-cola';

// Register the cola layout
cytoscape.use(cola);

interface KnowledgeGraphProps {
  data?: {
    nodes: Array<{
      id: string;
      label: string;
      type: string;
      properties?: Record<string, any>;
    }>;
    edges: Array<{
      source: string;
      target: string;
      relation: string;
      properties?: Record<string, any>;
    }>;
  };
  onNodeSelect?: (node: any) => void;
  onEdgeSelect?: (edge: any) => void;
}

const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ 
  data, 
  onNodeSelect, 
  onEdgeSelect 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cy, setCy] = useState<Core | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInfo, setSelectedInfo] = useState<any>(null);

  // Color scheme for different node types
  const nodeColors = {
    'publication': '#4C3FE1',
    'organism': '#22C55E', 
    'platform': '#A6E1FF',
    'experiment': '#7C5CFF',
    'condition': '#FF6B6B',
    'result': '#FFA500',
    'default': '#6B7280'
  };

  const initializeCytoscape = (graphData: any) => {
    if (!containerRef.current || !graphData) return;

    try {
      // Convert data to Cytoscape format
      const elements = [
        ...graphData.nodes.map((node: any) => ({
          data: {
            id: node.id,
            label: node.label,
            type: node.type,
            ...node.properties
          }
        })),
        ...graphData.edges.map((edge: any) => ({
          data: {
            source: edge.source,
            target: edge.target,
            relation: edge.relation,
            ...edge.properties
          }
        }))
      ];

      const cytoscapeInstance = cytoscape({
        container: containerRef.current,
        elements,
        style: [
          {
            selector: 'node',
            style: {
              'background-color': (ele: NodeSingular) => {
                const type = ele.data('type');
                return nodeColors[type as keyof typeof nodeColors] || nodeColors.default;
              },
              'label': 'data(label)',
              'color': '#ffffff',
              'font-size': '12px',
              'font-weight': 'bold',
              'text-halign': 'center',
              'text-valign': 'center',
              'width': '60px',
              'height': '60px',
              'border-width': '2px',
              'border-color': '#ffffff',
              'text-wrap': 'wrap',
              'text-max-width': '100px'
            }
          },
          {
            selector: 'node:selected',
            style: {
              'border-width': '4px',
              'border-color': '#FFD700',
              'background-color': '#FF6B6B'
            }
          },
          {
            selector: 'edge',
            style: {
              'width': 3,
              'line-color': '#94A3B8',
              'target-arrow-color': '#94A3B8',
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier',
              'label': 'data(relation)',
              'font-size': '10px',
              'color': '#64748B',
              'text-background-color': 'rgba(255,255,255,0.8)',
              'text-background-padding': '2px',
              'text-background-shape': 'roundrectangle'
            }
          },
          {
            selector: 'edge:selected',
            style: {
              'line-color': '#FFD700',
              'target-arrow-color': '#FFD700',
              'width': 5
            }
          }
        ],
        layout: {
          name: 'cola',
          animate: true,
          refresh: 1,
          maxSimulationTime: 4000,
          ungrabifyWhileSimulating: false,
          fit: true,
          padding: 30,
          nodeSpacing: 50,
          edgeLength: 100,
          randomize: false
        } as any,
        minZoom: 0.3,
        maxZoom: 3,
        wheelSensitivity: 0.2
      });

      // Event listeners
      cytoscapeInstance.on('tap', 'node', (event) => {
        const node = event.target;
        const nodeData = node.data();
        setSelectedInfo({
          type: 'node',
          data: nodeData
        });
        onNodeSelect?.(nodeData);
      });

      cytoscapeInstance.on('tap', 'edge', (event) => {
        const edge = event.target;
        const edgeData = edge.data();
        setSelectedInfo({
          type: 'edge',
          data: edgeData
        });
        onEdgeSelect?.(edgeData);
      });

      cytoscapeInstance.on('tap', (event) => {
        if (event.target === cytoscapeInstance) {
          setSelectedInfo(null);
        }
      });

      setCy(cytoscapeInstance);
      setLoading(false);

    } catch (err) {
      console.error('Failed to initialize knowledge graph:', err);
      setError('Failed to initialize knowledge graph');
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (data) {
        initializeCytoscape(data);
        return;
      }

      try {
        setLoading(true);
        const [nodesRes, edgesRes] = await Promise.all([
          fetch('/api/kg/nodes'),
          fetch('/api/kg/edges')
        ]);

        if (nodesRes.ok && edgesRes.ok) {
          const nodes = await nodesRes.json();
          const edges = await edgesRes.json();
          initializeCytoscape({ nodes, edges });
        } else {
          throw new Error('Failed to fetch knowledge graph data');
        }
      } catch (err) {
        console.error('Error fetching KG data:', err);
        setError('Failed to load knowledge graph data');
        setLoading(false);
      }
    };

    fetchData();
  }, [data]);

  useEffect(() => {
    return () => {
      if (cy) {
        cy.destroy();
      }
    };
  }, [cy]);

  const resetView = () => {
    if (cy) {
      cy.fit();
      cy.center();
    }
  };

  const filterByType = (nodeType: string) => {
    if (!cy) return;
    
    cy.batch(() => {
      cy.nodes().style('opacity', '0.3');
      cy.edges().style('opacity', '0.1');
      
      const filteredNodes = cy.nodes(`[type = "${nodeType}"]`);
      filteredNodes.style('opacity', '1');
      
      // Show connected edges
      filteredNodes.connectedEdges().style('opacity', '0.8');
      filteredNodes.connectedEdges().connectedNodes().style('opacity', '0.7');
    });
  };

  const clearFilters = () => {
    if (!cy) return;
    
    cy.batch(() => {
      cy.nodes().style('opacity', '1');
      cy.edges().style('opacity', '1');
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-900 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading knowledge graph...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-900 rounded-lg">
        <div className="text-center">
          <p className="text-red-400">❌ {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Control Panel */}
      <div className="absolute top-4 left-4 z-10 bg-gray-800 rounded-lg p-3 shadow-lg">
        <div className="flex flex-col gap-2">
          <button
            onClick={resetView}
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            🎯 Reset View
          </button>
          
          {/* Filter buttons */}
          <div className="flex flex-wrap gap-1">
            {Object.entries(nodeColors).slice(0, -1).map(([type, color]) => (
              <button
                key={type}
                onClick={() => filterByType(type)}
                className="px-2 py-1 text-xs text-white rounded capitalize"
                style={{ backgroundColor: color }}
              >
                {type}
              </button>
            ))}
          </div>
          
          <button
            onClick={clearFilters}
            className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Selected Info Panel */}
      {selectedInfo && (
        <div className="absolute top-4 right-4 z-10 bg-gray-800 rounded-lg p-3 shadow-lg max-w-xs">
          <h4 className="font-bold text-blue-400 mb-2">
            {selectedInfo.type === 'node' ? '📍 Node' : '🔗 Edge'} Details
          </h4>
          <div className="text-sm text-gray-300">
            {selectedInfo.type === 'node' ? (
              <>
                <p><strong>Label:</strong> {selectedInfo.data.label}</p>
                <p><strong>Type:</strong> {selectedInfo.data.type}</p>
                {selectedInfo.data.id && (
                  <p><strong>ID:</strong> {selectedInfo.data.id}</p>
                )}
              </>
            ) : (
              <>
                <p><strong>Relation:</strong> {selectedInfo.data.relation}</p>
                <p><strong>From:</strong> {selectedInfo.data.source}</p>
                <p><strong>To:</strong> {selectedInfo.data.target}</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Graph Container */}
      <div 
        ref={containerRef} 
        className="w-full h-96 bg-gray-900 rounded-lg border border-gray-700"
        style={{ minHeight: '600px' }}
      />

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        {Object.entries(nodeColors).slice(0, -1).map(([type, color]) => (
          <div key={type} className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="capitalize text-gray-300">{type}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KnowledgeGraph;