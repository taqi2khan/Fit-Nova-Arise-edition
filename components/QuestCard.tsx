import React from 'react';
import { Quest } from '../types';
import { SystemWindow, SystemButton } from './HoloUI';

interface QuestCardProps {
  quest: Quest;
  onComplete?: () => void;
  onObjectiveUpdate?: (index: number, newCurrent: number) => void;
}

export const QuestCard: React.FC<QuestCardProps> = ({ quest, onComplete, onObjectiveUpdate }) => {
  
  // Calculate if all objectives are done
  const allObjectivesMet = quest.objectives.every(obj => obj.current >= obj.total);

  return (
    <SystemWindow 
      title={quest.type === 'DAILY' ? 'QUEST INFO' : 'QUEST REWARDS'} 
      subtitle={quest.type === 'DAILY' ? '[DAILY QUEST: PREPARE TO BECOME STRONG]' : '[SYSTEM ALERT]'}
      className="mb-0" 
    >
      <div className="space-y-6 font-mono text-center">
         {/* Title Section */}
         <div>
            <h3 className="text-xl font-bold text-white mb-1 uppercase tracking-widest">{quest.title}</h3>
            <p className="text-gray-400 text-xs">{quest.description}</p>
         </div>

         {/* Goal List */}
         <div className="py-4">
            <h4 className="text-neon-blue font-orbitron font-bold text-lg mb-4 uppercase decoration-2 underline underline-offset-4 decoration-neon-blue/50">
                GOAL
            </h4>
            
            <div className="space-y-3">
               {quest.objectives.map((obj, idx) => {
                  const isDone = obj.current >= obj.total;
                  
                  return (
                    <div key={idx} className="flex justify-between items-center max-w-xs mx-auto border-b border-gray-800 pb-2 hover:bg-white/5 px-2 transition-colors rounded">
                        <span className={`text-gray-300 uppercase text-xs text-left w-1/2 ${isDone ? 'line-through text-gray-600' : ''}`}>
                            {obj.text}
                        </span>
                        
                        <div className="flex items-center gap-3">
                            <span className={`font-mono font-bold text-xs ${isDone ? 'text-green-500' : 'text-neon-blue'}`}>
                            [{obj.current}/{obj.total}{obj.unit || ''}]
                            </span>
                            
                            {/* Checkbox / Interaction Button */}
                            {!quest.completed && (
                                <button 
                                    onClick={() => {
                                        if (onObjectiveUpdate) {
                                            // Toggle logic: If done, reset to 0. If not done, set to total.
                                            const newVal = isDone ? 0 : obj.total;
                                            onObjectiveUpdate(idx, newVal);
                                        }
                                    }}
                                    className={`w-5 h-5 border flex items-center justify-center transition-all ${
                                        isDone 
                                        ? 'bg-neon-blue border-neon-blue hover:bg-neon-blue/80' 
                                        : 'border-gray-600 hover:border-neon-blue'
                                    }`}
                                >
                                    {isDone && <span className="text-black font-bold text-xs">✓</span>}
                                </button>
                            )}
                        </div>
                    </div>
                  );
               })}
            </div>
         </div>

         {/* Warning/Penalty Section */}
         {quest.penalty && !quest.completed && (
            <div className="mt-8">
               <p className="text-gray-400 text-xs uppercase">WARNING: If you do not complete this quest,</p>
               <p className="text-red-500 font-bold uppercase tracking-widest animate-pulse">
                  {quest.penalty}
               </p>
            </div>
         )}

         {/* Rewards (If completed) or Action */}
         {!quest.completed ? (
             <div className="pt-4 flex flex-col gap-2">
                <SystemButton 
                    onClick={onComplete} 
                    disabled={!allObjectivesMet}
                    className={!allObjectivesMet ? "opacity-50 cursor-not-allowed" : ""}
                >
                    {allObjectivesMet ? "Complete Quest" : "Requirements Pending"}
                </SystemButton>
                {!allObjectivesMet && (
                    <p className="text-[10px] text-red-400 uppercase tracking-wider">
                        * Finish all objectives to submit
                    </p>
                )}
             </div>
         ) : (
            <div className="border border-green-500/50 bg-green-900/10 p-4 mt-4">
               <p className="text-green-500 font-bold uppercase tracking-widest mb-2">Quest Completed</p>
               <div className="text-xs text-green-300">
                  REWARDS ACQUIRED: <br/>
                  XP +{quest.xpReward} <br/>
                  {Object.keys(quest.statRewards).map(k => `${k.toUpperCase().replace('_', ' ')} +${quest.statRewards[k as keyof typeof quest.statRewards]}`).join('\n')}
               </div>
            </div>
         )}
      </div>
    </SystemWindow>
  );
};