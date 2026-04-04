"use client";

import type { Dispatch, SetStateAction } from "react";
import { CreateSessionPanel } from "./CreateSessionPanel";
import { AddCandidatePanel } from "./AddCandidatePanel";
import { SessionAllowlistPanel } from "./SessionAllowlistPanel";
import type { StudentDirectoryItem } from "./types";

export function ManageSessionsTab(props: {
    sessionName: string;
    setSessionName: (v: string) => void;
    sessionDesc: string;
    setSessionDesc: (v: string) => void;
    sessionDuration: number;
    setSessionDuration: (v: number) => void;
    targetSessionId: number;
    setTargetSessionId: (v: number) => void;
    candidateName: string;
    setCandidateName: (v: string) => void;
    candidatePhotoUrl: string;
    setCandidatePhotoUrl: (v: string) => void;
    candidateVision: string;
    setCandidateVision: (v: string) => void;
    candidateMission: string;
    setCandidateMission: (v: string) => void;
    allowlistSessionId: number;
    setAllowlistSessionId: (v: number) => void;
    onReloadSessionAllowlist: (sessionId: number) => void;
    studentDirectoryQuery: string;
    setStudentDirectoryQuery: (v: string) => void;
    studentDirectoryLoading: boolean;
    studentDirectory: StudentDirectoryItem[];
    draftAllowlist: { value: string; label: string }[];
    setDraftAllowlist: Dispatch<SetStateAction<{ value: string; label: string }[]>>;
    allowlistAddresses: string[];
    allowlistBusy: boolean;
    loading: boolean;
    setLoading: (v: boolean) => void;
    onCreateSession: () => void;
    onAddCandidate: () => void;
    onSaveSessionAllowlist: () => void;
    onOpenStudentPicker?: () => void;
}) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in zoom-in-95 duration-200">
            <CreateSessionPanel
                sessionName={props.sessionName}
                setSessionName={props.setSessionName}
                sessionDesc={props.sessionDesc}
                setSessionDesc={props.setSessionDesc}
                sessionDuration={props.sessionDuration}
                setSessionDuration={props.setSessionDuration}
                loading={props.loading}
                onCreateSession={props.onCreateSession}
            />
            <AddCandidatePanel
                targetSessionId={props.targetSessionId}
                setTargetSessionId={props.setTargetSessionId}
                candidateName={props.candidateName}
                setCandidateName={props.setCandidateName}
                candidatePhotoUrl={props.candidatePhotoUrl}
                setCandidatePhotoUrl={props.setCandidatePhotoUrl}
                candidateVision={props.candidateVision}
                setCandidateVision={props.setCandidateVision}
                candidateMission={props.candidateMission}
                setCandidateMission={props.setCandidateMission}
                loading={props.loading}
                setLoading={props.setLoading}
                onAddCandidate={props.onAddCandidate}
            />
            <SessionAllowlistPanel
                allowlistSessionId={props.allowlistSessionId}
                setAllowlistSessionId={props.setAllowlistSessionId}
                onReloadSessionAllowlist={props.onReloadSessionAllowlist}
                studentDirectoryQuery={props.studentDirectoryQuery}
                setStudentDirectoryQuery={props.setStudentDirectoryQuery}
                studentDirectoryLoading={props.studentDirectoryLoading}
                studentDirectory={props.studentDirectory}
                draftAllowlist={props.draftAllowlist}
                setDraftAllowlist={props.setDraftAllowlist}
                allowlistAddresses={props.allowlistAddresses}
                allowlistBusy={props.allowlistBusy}
                onSaveSessionAllowlist={props.onSaveSessionAllowlist}
                onOpenStudentPicker={props.onOpenStudentPicker}
            />
        </div>
    );
}
