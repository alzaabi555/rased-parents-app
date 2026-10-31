import React, { useMemo, useState } from 'react';
import type { AlertTabId, TabId } from './types/parent';
import { SubjectDetails } from './components/SubjectDetails';
import { ParentLogin } from './components/ParentLogin';
import { WelcomeScreen } from './components/WelcomeScreen';
import { BottomNavigation } from './components/BottomNavigation';
import { ParentDashboard } from './components/ParentDashboard';
import { ParentAlerts } from './components/ParentAlerts';
import { ParentProfile } from './components/ParentProfile';
import { ParentSubjects } from './components/subjects/ParentSubjects';
import { buildParentSummary } from './utils/parentViewUtils';
import { useParentMessages } from './hooks/useParentMessages';
import { ParentMessagesModal } from './components/messages/ParentMessagesModal';
import { useParentStudent } from './hooks/useParentStudent';
import { useParentSession } from './hooks/useParentSession';
import { useSavedChildren } from './hooks/useSavedChildren';
import { useParentNotifications } from './hooks/useParentNotifications';

function App() {
  const [currentTab, setCurrentTab] = useState<TabId>('home');
  const [activeAlertTab, setActiveAlertTab] = useState<AlertTabId>('all');
  const { savedProfiles, saveProfile, removeProfile } = useSavedChildren();
  const { notifyUpdates } = useParentNotifications();
  const student = useParentStudent({ saveProfile, notifyUpdates });
  const { clearSession } = useParentSession({ loadStudent: student.loadStudent });
  const {
    secretCode, setSecretCode, allSubjects, selectedSubject, setSelectedSubject,
    isLoading, isRefreshing, error, showWelcomeScreen, loadStudent, clearStudent,
  } = student;
  const parentSummary = useMemo(() => buildParentSummary(allSubjects), [allSubjects]);

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    void loadStudent(secretCode);
  };

  const handleLogout = () => {
    clearSession();
    clearStudent();
    setCurrentTab('home');
  };

  const removeSavedProfile = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    removeProfile(id);
    if (secretCode === id) setSecretCode('');
  };

  const messages = useParentMessages({
    selectedSubject,
    secretCode,
    refresh: () => loadStudent(secretCode, false, true),
  });

  if (!allSubjects.length && !showWelcomeScreen) {
    return (
      <ParentLogin
        secretCode={secretCode}
        error={error}
        isLoading={isLoading}
        savedProfiles={savedProfiles}
        onCodeChange={setSecretCode}
        onSubmit={handleLogin}
        onSelectChild={profile => loadStudent(profile.centralStudentId || profile.currentRasedId || profile.id)}
        onRemoveChild={removeSavedProfile}
      />
    );
  }

  if (showWelcomeScreen && allSubjects.length > 0) {
    return <WelcomeScreen studentName={allSubjects[0]?.name || 'الطالب'} />;
  }

  const showSubjectDetails = currentTab === 'subjects' && selectedSubject;

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-[#f0f4f8] font-sans text-slate-800" dir="rtl">
      <div className="pointer-events-none absolute right-[-10%] top-[-10%] h-[40%] w-[50%] rounded-full bg-indigo-300/20 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-[10%] left-[-10%] h-[50%] w-[40%] rounded-full bg-blue-300/20 blur-[100px]" />

      <div className="absolute inset-0 z-10">
        {currentTab === 'home' && (
          <ParentDashboard
            allSubjects={allSubjects}
            parentSummary={parentSummary}
            isRefreshing={isRefreshing}
            onRefresh={() => loadStudent(secretCode, true)}
            onOpenSubjects={() => {
              setSelectedSubject(null);
              setCurrentTab('subjects');
            }}
          />
        )}

        {currentTab === 'subjects' && (
          showSubjectDetails ? (
            <SubjectDetails
              subjectData={selectedSubject}
              onBack={() => setSelectedSubject(null)}
              onOpenMessage={() => messages.setOpen(true)}
            />
          ) : (
            <ParentSubjects allSubjects={allSubjects} onSelectSubject={setSelectedSubject} />
          )
        )}

        {currentTab === 'alerts' && (
          <ParentAlerts allSubjects={allSubjects} activeAlertTab={activeAlertTab} onTabChange={setActiveAlertTab} />
        )}

        {currentTab === 'profile' && (
          <ParentProfile
            allSubjects={allSubjects}
            savedProfilesCount={savedProfiles.length}
            secretCode={secretCode}
            parentSummary={parentSummary}
            onLogout={handleLogout}
          />
        )}
      </div>

      {!showSubjectDetails && (
        <BottomNavigation
          currentTab={currentTab}
          negativeCount={parentSummary.negativeCount}
          onChange={tab => {
            setCurrentTab(tab);
            setSelectedSubject(null);
          }}
        />
      )}

      <ParentMessagesModal
        open={messages.open}
        subject={selectedSubject}
        items={messages.items}
        messageText={messages.messageText}
        replyText={messages.replyText}
        replyingTo={messages.replyingTo}
        isSending={messages.isSending}
        isSendingReply={messages.isSendingReply}
        onClose={() => messages.setOpen(false)}
        onMessageChange={messages.setMessageText}
        onReplyTextChange={messages.setReplyText}
        onStartReply={item => { messages.setReplyingTo(item); messages.setReplyText(''); }}
        onCancelReply={() => { messages.setReplyingTo(null); messages.setReplyText(''); }}
        onSend={messages.send}
        onSendReply={messages.sendReply}
      />
    </div>
  );
}

export default App;
