
import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import {  Play,  Split,  Repeat,  Clock,  Share2,  Power,  Code2} from 'lucide-react';

interface NodeWrapperProps {
  children?: React.ReactNode;
  selected: boolean;
  title: string;
  icon: any;
  colorClass: string;
}

const NodeWrapper = ({ children, selected, title, icon: Icon, colorClass }: NodeWrapperProps) => (
  <div className={`px-4 py-2 shadow-xl rounded-xl bg-neutral-900 border-2 min-w-[150px] transition-all ${selected ? 'border-purple-500 shadow-purple-500/20' : 'border-neutral-800'}`}>
    <div className="flex items-center">
      <div className={`rounded-lg p-1.5 mr-3 ${colorClass}`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div>
        <div className="text-xs font-bold text-neutral-300">{title}</div>
      </div>
    </div>
    {children}
  </div>
);

export const TestNode = memo(({ data, selected }: NodeProps) => {
  return (
    <NodeWrapper selected={selected} title="Test Case" icon={Play} colorClass="bg-emerald-600">
      <Handle type="target" position={Position.Top} className="!bg-neutral-500" />
      <div className="mt-2 text-[10px] text-neutral-500 font-mono text-center">
          {(data as any).label || 'Select Test...'}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-emerald-500" />
    </NodeWrapper>
  );
});

export const ConditionNode = memo(({ data, selected }: NodeProps) => {
  return (
    <NodeWrapper selected={selected} title="Condition" icon={Split} colorClass="bg-orange-600">
      <Handle type="target" position={Position.Top} className="!bg-neutral-500" />
      <div className="mt-2 text-[10px] text-neutral-500 font-mono text-center truncate px-1">
          {(data as any).condition || 'If...'}
      </div>
      <div className="flex justify-between mt-2 px-1">
          <div className="text-[9px] text-emerald-500 font-bold">True</div>
          <div className="text-[9px] text-red-500 font-bold">False</div>
      </div>
      <Handle type="source" position={Position.Bottom} id="true" style={{ left: '30%' }} className="!bg-emerald-500" />
      <Handle type="source" position={Position.Bottom} id="false" style={{ left: '70%' }} className="!bg-red-500" />
    </NodeWrapper>
  );
});

export const LoopNode = memo(({ data, selected }: NodeProps) => {
  return (
    <NodeWrapper selected={selected} title="Loop" icon={Repeat} colorClass="bg-blue-600">
      <Handle type="target" position={Position.Top} className="!bg-neutral-500" />
      <div className="mt-2 text-[10px] text-neutral-500 font-mono text-center">
        {(data as any).variable ? `For each ${(data as any).variable}` : 'Configure Loop'}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-blue-500" />
    </NodeWrapper>
  );
});

export const DelayNode = memo(({ data, selected }: NodeProps) => {
  return (
    <NodeWrapper selected={selected} title="Delay" icon={Clock} colorClass="bg-neutral-600">
      <Handle type="target" position={Position.Top} className="!bg-neutral-500" />
      <div className="mt-2 text-[10px] text-neutral-500 font-mono text-center">
          {(data as any).duration ? `${(data as any).duration}ms` : '0ms'}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-neutral-500" />
    </NodeWrapper>
  );
});

export const WebhookNode = memo(({ data, selected }: NodeProps) => {
    return (
      <NodeWrapper selected={selected} title="Webhook" icon={Share2} colorClass="bg-pink-600">
        <Handle type="target" position={Position.Top} className="!bg-neutral-500" />
        <div className="mt-2 text-[10px] text-neutral-500 font-mono text-center truncate max-w-[120px]">
            {(data as any).url || 'http://...'}
        </div>
        <Handle type="source" position={Position.Bottom} className="!bg-pink-500" />
      </NodeWrapper>
    );
});
  
export const EndNode = memo(({ selected }: NodeProps) => {
    return (
      <NodeWrapper selected={selected} title="End" icon={Power} colorClass="bg-red-600">
        <Handle type="target" position={Position.Top} className="!bg-neutral-500" />
      </NodeWrapper>
    );
});

export const FunctionNode = memo(({ data, selected }: NodeProps) => {
    return (
      <NodeWrapper selected={selected} title="Function" icon={Code2} colorClass="bg-yellow-600">
        <Handle type="target" position={Position.Top} className="!bg-neutral-500" />
        <div className="mt-2 text-[10px] text-neutral-500 font-mono text-center">
            {(data as any).functionName || 'Select Func...'}
        </div>
        <Handle type="source" position={Position.Bottom} className="!bg-yellow-500" />
      </NodeWrapper>
    );
});
