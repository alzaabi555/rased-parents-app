import { useCallback, useState } from 'react';
import type { SavedProfile } from '../types/parent';
import type { ParentIdentity, ParentStudentResult } from '../types/parentStudent';
import { fetchParentStudent } from '../services/parentApi';
import { getOrCreateParentAccountId, linkParentStudent } from '../services/parentAccountService';
import { readStudentCache, saveSessionCode, saveStudentCache } from '../services/parentStorageService';

interface Args {
  saveProfile: (profile: SavedProfile, loginCode: string) => SavedProfile[];
  notifyUpdates: (studentName:string, grades:number, alerts:number, replies:number)=>Promise<void>|void;
}
const normalizeSubjectList = (result: ParentStudentResult) => {
  const subjects = Array.isArray(result.subjects) ? result.subjects : Array.isArray(result.data?.subjects) ? result.data.subjects : Array.isArray(result.data) ? result.data : [];
  const summary = result.gameResultsSummary || result.learningSummary || result.data?.gameResultsSummary || result.data?.learningSummary;
  return summary && subjects.length ? subjects.map((subject:any,index:number)=>index===0?{...subject,gameResultsSummary:summary,learningSummary:summary}:subject) : subjects;
};
const compareUpdates = (oldList:any[], nextList:any[]) => {
  let grades=0,alerts=0,replies=0;
  nextList.forEach((next,index)=>{ const old=oldList[index]; if(!old)return;
    grades+=Math.max(0,(next.grades?.length||0)-(old.grades?.length||0));
    alerts+=Math.max(0,(next.behaviors?.length||0)-(old.behaviors?.length||0));
    const oldReplies=old.parentMessages?.filter((m:any)=>m.teacherReply)?.length||old.teacherReplies?.length||0;
    const nextReplies=next.parentMessages?.filter((m:any)=>m.teacherReply)?.length||next.teacherReplies?.length||0;
    replies+=Math.max(0,nextReplies-oldReplies);
  });
  return {grades,alerts,replies};
};
export const useParentStudent = ({saveProfile,notifyUpdates}:Args) => {
  const [secretCode,setSecretCode]=useState('');
  const [allSubjects,setAllSubjects]=useState<any[]>([]);
  const [selectedSubject,setSelectedSubject]=useState<any>(null);
  const [isLoading,setIsLoading]=useState(false);
  const [isRefreshing,setIsRefreshing]=useState(false);
  const [error,setError]=useState('');
  const [showWelcomeScreen,setShowWelcomeScreen]=useState(false);
  const loadStudent=useCallback(async(id:string,manual=false,silent=false)=>{
    const code=id.trim().toUpperCase();
    if(!code){if(!silent)setError('الرجاء إدخال الكود السري للطالب.');return;}
    if(!silent){manual?setIsRefreshing(true):setIsLoading(true);setError('');}
    try{
      const result=await fetchParentStudent(code);
      if(!(result.status==='success'||result.success===true)){if(!silent)setError(result.message||'لم يتم العثور على بيانات الطالب.');return;}
      const subjects=normalizeSubjectList(result);
      const identity:ParentIdentity=result.identity||subjects[0]||{};
      const name=subjects[0]?.name||'طالب';
      const old=readStudentCache(code);
      if(old.length){const delta=compareUpdates(old,subjects);if(delta.grades||delta.alerts||delta.replies)await notifyUpdates(name,delta.grades,delta.alerts,delta.replies);}
      let parentAccountId=getOrCreateParentAccountId();
      const centralStudentId=String(identity.centralStudentId||'').trim();
      if(centralStudentId){try{const link=await linkParentStudent(centralStudentId,name);parentAccountId=link.canonicalParentAccountId||link.parentAccountId||parentAccountId;}catch(e){console.warn('Family link pending:',e);}}
      const centralRasedId=String(identity.centralRasedId||'').trim();
      saveProfile({id:centralStudentId||code,name,centralStudentId:centralStudentId||undefined,currentRasedId:centralRasedId||code,centralRasedId:centralRasedId||undefined,legacyRasedIds:Array.isArray(identity.legacyRasedIds)?identity.legacyRasedIds:[],identityStatus:String(identity.identityStatus||(centralStudentId?'central_linked':'experimental_unlinked')),parentAccountId},code);
      saveStudentCache(code,identity,subjects);
      setAllSubjects(subjects);
      setSelectedSubject(current=>current?subjects.find((subject:any)=>subject.subject===current.subject&&subject.schoolName===current.schoolName)||null:null);
      saveSessionCode(code);setSecretCode(code);
      if(!manual&&!silent){setShowWelcomeScreen(true);window.setTimeout(()=>setShowWelcomeScreen(false),2200);}
    }catch(e){if(!silent)setError(e instanceof Error?e.message:'خطأ في الاتصال بالسحابة.');}
    finally{if(!silent){setIsLoading(false);setIsRefreshing(false);}}
  },[notifyUpdates,saveProfile]);
  const clearStudent=useCallback(()=>{setAllSubjects([]);setSelectedSubject(null);setSecretCode('');setError('');},[]);
  return {secretCode,setSecretCode,allSubjects,selectedSubject,setSelectedSubject,isLoading,isRefreshing,error,showWelcomeScreen,loadStudent,clearStudent};
};
