import { useState, useEffect } from 'react';
import type { FC } from 'react';
import {
  journalsApi,
  CorrectionRequestStatus,
} from '../../services/journalsApi';
import type { CorrectionRequest } from '../../services/journalsApi';
import { CheckCircle2, XCircle, FileDiff, X, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CorrectionRequestsModal: FC<Props> = ({ isOpen, onClose }) => {
  const [requests, setRequests] = useState<CorrectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewerNotes, setReviewerNotes] = useState<Record<string, string>>({});

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await journalsApi.getCorrectionRequests();
      setRequests(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch correction requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRequests();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApprove = async (id: string) => {
    try {
      const note = reviewerNotes[id] || '';
      await journalsApi.approveCorrectionRequest(id, note);
      await fetchRequests();
    } catch (err: any) {
      alert(err.message || 'Failed to approve correction request');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const note = reviewerNotes[id] || '';
      await journalsApi.rejectCorrectionRequest(id, note);
      await fetchRequests();
    } catch (err: any) {
      alert(err.message || 'Failed to reject correction request');
    }
  };

  const pendingRequests = requests.filter((r) => r.status === CorrectionRequestStatus.PENDING);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FileDiff className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Historical Log Entry Correction Requests</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="text-xs text-slate-500 p-8 text-center">Loading correction requests...</div>
        ) : pendingRequests.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
            No pending historical log entry correction requests.
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">
                    Request ID: <span className="font-mono">{req.id.substring(0, 8)}...</span>
                  </span>
                  <span className="text-amber-400 font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20">
                    PENDING APPROVAL
                  </span>
                </div>

                <div className="text-xs text-slate-300">
                  <strong className="text-slate-400 block uppercase text-[10px]">Reason for Correction Request:</strong>
                  <p className="mt-0.5 text-slate-200">{req.reason}</p>
                </div>

                {/* Proposed Data Diff */}
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs font-mono">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Proposed Corrected Data Payload:</span>
                  <pre className="text-emerald-400 whitespace-pre-wrap">
                    {JSON.stringify(req.proposedData, null, 2)}
                  </pre>
                </div>

                {/* Reviewer Note Input & Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <input
                    type="text"
                    placeholder="Optional reviewer note..."
                    value={reviewerNotes[req.id] || ''}
                    onChange={(e) => setReviewerNotes({ ...reviewerNotes, [req.id]: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleReject(req.id)}
                      className="flex items-center gap-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 text-xs font-semibold px-3 py-1.5 rounded-xl transition"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                    <button
                      onClick={() => handleApprove(req.id)}
                      className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition shadow-md shadow-emerald-600/20"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Approve Correction
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
