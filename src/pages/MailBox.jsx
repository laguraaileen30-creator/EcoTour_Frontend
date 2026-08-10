import React, { useState } from 'react';
import { useEcoTour } from '../context/EcoTourContext';
import { Mail, X, Trash2, Inbox, ShieldCheck, KeyRound } from 'lucide-react'; // ✅ ADDED ALL MISSING ICONS

export const MailOutboxModal = ({ isOpen, onClose }) => {
  const { outboxEmails, markEmailAsRead, clearOutbox } = useEcoTour();
  const [selectedEmail, setSelectedEmail] = useState(null);

  if (!isOpen) return null;

  const handleSelectEmail = (email) => {
    setSelectedEmail(email);
    if (!email.read) {
      markEmailAsRead(email.id);
    }
  };

  const unreadCount = outboxEmails.filter((e) => !e.read).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-4xl rounded-3xl shadow-2xl text-slate-100 overflow-hidden flex flex-col h-[85vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-800/90 border-b border-slate-700/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#3d5a45] to-[#0d2319] border border-[#87a987]/40 text-[#87a987] flex items-center justify-center shadow-md">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  System Mail Outbox
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#87a987]/20 border border-[#87a987]/40 text-[#87a987] text-[10px] font-black uppercase">
                  Dev Mail Service
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Simulated outgoing emails for account approvals, credentials &
                security alerts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {outboxEmails.length > 0 && (
              <button
                onClick={clearOutbox}
                className="px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear Outbox</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Email List Sidebar */}
          <div className="w-full md:w-80 bg-slate-900/90 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col overflow-y-auto">
            <div className="p-3 bg-slate-950/60 border-b border-slate-800 text-xs font-bold text-slate-400 flex items-center justify-between">
              <span>SENT EMAILS ({outboxEmails.length})</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                  {unreadCount} Unread
                </span>
              )}
            </div>

            {outboxEmails.length === 0 ? (
              <div className="p-8 text-center space-y-2 my-auto">
                <Inbox className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-500 font-semibold">
                  No outgoing emails in outbox yet.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {outboxEmails.map((email) => {
                  const isSelected = selectedEmail?.id === email.id;
                  return (
                    <button
                      key={email.id}
                      onClick={() => handleSelectEmail(email)}
                      className={`w-full p-3.5 text-left transition-all cursor-pointer flex flex-col gap-1 ${
                        isSelected
                          ? 'bg-[#1b382b] border-l-4 border-[#87a987]'
                          : !email.read
                          ? 'bg-slate-800/50 hover:bg-slate-800'
                          : 'hover:bg-slate-800/30 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span
                          className={
                            isSelected || !email.read
                              ? 'text-white'
                              : 'text-slate-300'
                          }
                        >
                          To: {email.to}
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {email.sentAt}
                        </span>
                      </div>

                      <div className="text-xs font-semibold truncate text-slate-200">
                        {email.subject}
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-[#87a987] font-mono border border-slate-700">
                          {email.template}
                        </span>

                        {!email.read && (
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Email Preview Area */}
          <div className="flex-1 bg-slate-950 p-4 sm:p-6 overflow-y-auto flex flex-col">
            {selectedEmail ? (
              <div className="space-y-4 max-w-2xl mx-auto w-full">
                {/* Meta details */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">
                      RECIPIENT:
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {selectedEmail.to}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">
                      SUBJECT:
                    </span>
                    <span className="text-xs font-bold text-white">
                      {selectedEmail.subject}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>SENT TIME:</span>
                    <span>{selectedEmail.sentAt}</span>
                  </div>
                </div>

                {/* Email Body Card */}
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 text-xs leading-relaxed space-y-4 shadow-xl">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                    <div className="w-8 h-8 rounded-xl bg-[#0d2319] border border-[#87a987]/30 flex items-center justify-center text-[#87a987]">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-extrabold text-white">
                        EcoTourVista Resort Portal
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Official Automated Notification Service
                      </div>
                    </div>
                  </div>

                  <div
                    className="prose prose-invert max-w-none text-xs space-y-3"
                    dangerouslySetInnerHTML={{
                      __html: selectedEmail.bodyHtml,
                    }}
                  />

                  {selectedEmail.credentials && (
                    <div className="p-4 rounded-xl bg-slate-950 border border-[#87a987]/40 space-y-2">
                      <div className="text-xs font-bold text-[#87a987] flex items-center gap-1.5">
                        <KeyRound className="w-4 h-4" />
                        <span>Issued Login Credentials:</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div className="p-2 bg-slate-900 rounded-lg">
                          <span className="text-slate-400 text-[10px] block">
                            Username:
                          </span>
                          <span className="font-bold text-white">
                            {selectedEmail.credentials.username}
                          </span>
                        </div>
                        <div className="p-2 bg-slate-900 rounded-lg">
                          <span className="text-slate-400 text-[10px] block">
                            Password:
                          </span>
                          <span className="font-bold text-emerald-400">
                            {selectedEmail.credentials.tempPassword ||
                              'User-Defined'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-800 text-center text-[10px] text-slate-500">
                    This is an automated system email notification from
                    EcoTourVista Cold Spring Resort.
                  </div>
                </div>
              </div>
            ) : (
              <div className="my-auto text-center space-y-3">
                <Mail className="w-12 h-12 text-slate-700 mx-auto" />
                <h3 className="text-sm font-bold text-slate-400">
                  Select an Email to Inspect Content
                </h3>
                <p className="text-xs text-slate-600 max-w-xs mx-auto">
                  Click any outgoing email on the left panel to preview the
                  formatted HTML email body and credentials.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};