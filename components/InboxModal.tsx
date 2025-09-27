import React, { useState } from 'react';
import { BattleReport } from '../types';
import BattleReportView from './BattleReportView';

interface InboxModalProps {
  reports: BattleReport[];
  onClose: () => void;
  onMarkAsRead: (reportId: string) => void;
}

const InboxModal: React.FC<InboxModalProps> = ({ reports, onClose, onMarkAsRead }) => {
    const [selectedReport, setSelectedReport] = useState<BattleReport | null>(null);

    const handleSelectReport = (report: BattleReport) => {
        setSelectedReport(report);
        if (!report.isRead) {
            onMarkAsRead(report.id);
        }
    }

    const handleBackToList = () => {
        setSelectedReport(null);
    }

    return (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-[fadeIn_0.3s_ease-in-out]"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
        >
            <div 
                className="bg-gray-900 border border-gold rounded-lg shadow-2xl w-full max-w-3xl h-[80vh] text-white p-6 relative flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                  onClick={onClose} 
                  className="absolute top-2 right-2 text-gray-400 hover:text-white text-3xl z-10"
                  aria-label="Close"
                >&times;</button>
                
                {selectedReport ? (
                    <BattleReportView report={selectedReport} onBack={handleBackToList} />
                ) : (
                    <>
                        <h2 className="text-3xl font-bold text-gold text-center mb-4">Battle Reports</h2>
                        <div className="flex-1 overflow-y-auto pr-2 space-y-2">
                            {reports.length === 0 && (
                                <p className="text-center text-gray-400 mt-8">No reports yet.</p>
                            )}
                            {reports.map(report => (
                                <div
                                    key={report.id}
                                    onClick={() => handleSelectReport(report)}
                                    className={`p-3 rounded-lg cursor-pointer transition-colors duration-200 flex justify-between items-center ${report.isRead ? 'bg-gray-800/60 hover:bg-gray-700/60' : 'bg-blue-900/50 hover:bg-blue-800/50 animate-pulse-slow'}`}
                                    role="button"
                                >
                                    <div>
                                        <span className={`font-bold ${report.victory ? 'text-green-400' : 'text-red-400'}`}>
                                            {report.victory ? 'Victory' : 'Defeat'}
                                        </span>
                                        <span className="text-gray-300"> vs. Village at ({report.defenderCoords.x}, {report.defenderCoords.y})</span>
                                    </div>
                                    <span className="text-sm text-gray-400">{new Date(report.timestamp).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default InboxModal;
