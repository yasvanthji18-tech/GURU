import React from 'react';
import { GitBranch, Layers, ChevronRight } from 'lucide-react';

export default function ConceptMap({ nodes }) {
  if (!nodes || nodes.length === 0) {
    return (
      <div className="p-8 text-center glass-panel rounded-2xl border border-gray-800 text-gray-400">
        <GitBranch className="w-8 h-8 text-indigo-400 mx-auto mb-2 opacity-60" />
        <p>No concept hierarchy generated yet. Ingest notes to build concept map.</p>
      </div>
    );
  }

  // Group nodes by parent
  const rootNodes = nodes.filter(n => !n.parent_label);
  const childNodes = nodes.filter(n => n.parent_label);

  return (
    <div className="glass-panel p-6 rounded-2xl border border-indigo-500/20 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-bold text-white font-outfit">Structured Concept Hierarchy</h3>
        </div>
        <span className="text-xs text-indigo-300 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
          {nodes.length} Concept Nodes
        </span>
      </div>

      <div className="space-y-4">
        {rootNodes.map((root) => {
          const children = childNodes.filter(c => c.parent_label === root.label);
          return (
            <div key={root.id} className="p-4 rounded-xl bg-gray-900/80 border border-indigo-500/30 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse"></span>
                <h4 className="font-bold text-white text-base">{root.label}</h4>
              </div>
              <p className="text-xs text-gray-300 pl-5">{root.description}</p>

              {/* Children Branches */}
              {children.length > 0 && (
                <div className="pl-6 border-l-2 border-indigo-500/30 mt-3 space-y-2">
                  {children.map((child) => (
                    <div key={child.id} className="p-3 rounded-lg bg-gray-950/60 border border-gray-800 flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-xs font-bold text-purple-200">{child.label}</h5>
                        <p className="text-[11px] text-gray-400 mt-0.5">{child.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
