import React, { useState, useEffect } from 'react';
import { 
  Monitor, Smartphone, Sun, Moon, PenTool, LogOut, 
  Sparkles, ChevronRight, Copy, Info, Zap, Users,
  Loader2, BookOpen, Target, Type as TypeIcon, Menu, X,
  Book, Database, ShieldCheck, Bookmark, AlertCircle, User,
  Github, ExternalLink
} from 'lucide-react';
import { UserRole, UserStatus, UserProfile, StyleRule, CorrectionResult } from './types';
import { processArticleStudio, suggestTitles } from './services/gemini';
import { supabase, isSupabaseConfigured } from './lib/supabase';

// 사이트 소유자 및 관리자 설정
const ADMIN_EMAIL = 'mrmoon@bloter.net';
const ADMIN_NAME = '문병선';
const REPO_URL = 'https://github.com/mrmoon-ui/Numbers-AI';

const INITIAL_STYLEBOOK: StyleRule[] = [
  { id: '1', category: 'proofreading', rule: '회사이름(한국어/외국어), 기관명, 화폐단위, 년도 표기는 띄어쓰기 지적 제외' },
  { id: '2', category: 'editing', rule: '주어-서술어 불일치 및 비문 수정, 중복 표현 제거' },
  { id: '3', category: 'polishing', rule: '블로터/넘버스 특유의 신뢰감 있는 문체 유지' },
  { id: '4', category: 'editing', rule: '불필요한 외래어(일본식 표현 등)를 쉽고 자연스러운 우리말로 순화' }
];

const Badge = ({ children, color = 'blue' }: { children?: React.ReactNode, color?: string }) => {
  const colors: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  };
  return <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${colors[color]}`}>{children}</span>;
};

const ArticleStudio = ({ stylebook }: { stylebook: StyleRule[] }) => {
  const [content, setContent] = useState('');
  const [result, setResult] = useState<(CorrectionResult & { citations?: any[] }) | null>(null);
  const [loading, setLoading] = useState(false);

  const handleProcess = async () => {
    if (!content.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const stylebookStr = stylebook.map(r => `[${r.category}] ${r.rule}`).join('\n');
      const res = await processArticleStudio(content, stylebookStr);
      setResult(res);
    } catch (err) {
      console.error(err);
      alert('AI 분석 중 오류가 발생했습니다. API_KEY가 설정되어 있는지 확인하세요.');
    }
    setLoading(false);
  };

  const getTypeText = (type: string) => {
    const map: Record<string, string> = { 'proofreading': '교정', 'editing': '교열', 'refining': '윤문', '교정': '교정', '교열': '교열', '윤문': '윤문' };
    return map[type] || type;
  };

  const getTypeColor = (type: string) => {
    if (type.includes('교정') || type === 'proofreading') return 'green';
    if (type.includes('윤문') || type === 'refining') return 'purple';
    return 'blue';
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col space-y-6 lg:space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-lg"><PenTool size={20}/></div>
          <div>
            <h2 className="text-2xl lg:text-3xl font-black dark:text-white">편집 스튜디오</h2>
            <p className="text-sm text-gray-500 font-medium">Gemini 3 Pro 심층 교열 엔진</p>
          </div>
        </div>
        <button 
          onClick={handleProcess}
          disabled={loading || !content}
          className="w-full lg:w-auto flex items-center justify-center space-x-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black transition-all shadow-xl active:scale-95 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={20}/> : <Sparkles size={20}/>}
          <span>AI 편집 실행</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl lg:rounded-[40px] border dark:border-zinc-800 shadow-sm flex flex-col min-h-[300px] lg:min-h-[500px]">
          <div className="px-6 py-3 border-b dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/50 flex justify-between items-center">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">원문 기사</span>
            <span className="text-[10px] font-bold text-gray-400">{content.length} 자</span>
          </div>
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 p-6 lg:p-10 bg-transparent focus:outline-none resize-none dark:text-zinc-200 leading-relaxed text-base lg:text-lg"
            placeholder="기사 본문을 입력하세요..."
          />
        </div>

        <div className="hidden lg:flex bg-white dark:bg-zinc-900 rounded-[40px] border dark:border-zinc-800 shadow-sm flex flex-col min-h-[500px]">
          <div className="px-6 py-3 border-b dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/50 flex justify-between items-center">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">AI 편집 결과</span>
          </div>
          <div className="flex-1 p-10 dark:text-zinc-200 leading-relaxed text-lg whitespace-pre-wrap overflow-y-auto no-scrollbar">
            {loading ? <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32}/></div> : (result?.corrected || <div className="text-gray-300 italic text-center py-20">내용 입력 후 상단의 'AI 편집 실행'을 눌러주세요.</div>)}
          </div>
        </div>
      </div>

      {result && result.explanations && (
        <div className="space-y-4 px-1 lg:px-0">
          <h3 className="text-lg font-black dark:text-white flex items-center gap-2"><Info size={20} className="text-blue-500"/> 편집 제안 및 근거</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {result.explanations.map((exp, idx) => (
              <div key={idx} className="p-5 bg-white dark:bg-zinc-900 rounded-2xl lg:rounded-3xl border dark:border-zinc-800 shadow-sm space-y-3">
                <div className="flex justify-between items-center"><Badge color={getTypeColor(exp.type)}>{getTypeText(exp.type)}</Badge></div>
                <div className="space-y-1.5 text-sm">
                  <div className="text-red-500/70 line-through bg-red-50 dark:bg-red-950/20 px-1 rounded inline">{exp.target}</div>
                  <div className="flex items-start gap-1 text-green-600 font-bold">
                    <ChevronRight size={14} className="mt-1 shrink-0"/> <span className="bg-green-50 dark:bg-green-950/20 px-1 rounded">{exp.change}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 italic pt-2 border-t dark:border-zinc-800">{exp.reason}</p>
                {exp.source && <div className="text-[9px] text-gray-400 font-bold flex items-center gap-1"><Bookmark size={10}/> 근거: {exp.source}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="lg:hidden">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border dark:border-zinc-800 shadow-sm flex flex-col min-h-[300px]">
          <div className="px-6 py-3 border-b dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/50 flex justify-between items-center">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">AI 편집 결과</span>
            {result && <button onClick={() => {navigator.clipboard.writeText(result.corrected); alert('복사되었습니다.');}} className="text-blue-500 text-[10px] font-bold">전체 복사</button>}
          </div>
          <div className="flex-1 p-6 dark:text-zinc-200 leading-relaxed text-sm whitespace-pre-wrap">
            {loading ? <div className="h-full flex items-center justify-center py-10"><Loader2 className="animate-spin text-blue-600"/></div> : (result?.corrected || <span className="text-gray-400 italic text-center block py-10">원문 입력 후 'AI 편집 실행'을 눌러주세요.</span>)}
          </div>
        </div>
      </div>
    </div>
  );
};

const TitleSuggester = ({ stylebook }: { stylebook: StyleRule[] }) => {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'PRE' | 'POST'>('POST');
  const [titles, setTitles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSuggest = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setTitles([]);
    try {
      const res = await suggestTitles(input, mode, "", "신뢰감 있는 전문적인");
      setTitles(res.titles);
    } catch (err) {
      alert('제목 추천 중 오류가 발생했습니다.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col space-y-6 lg:space-y-8 animate-fade-in pb-10">
      <div className="text-center space-y-4">
        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl"><Sparkles className="text-white" size={28}/></div>
        <h2 className="text-2xl lg:text-3xl font-black dark:text-white">AI 제목 추천기</h2>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl lg:rounded-[40px] border dark:border-zinc-800 shadow-xl overflow-hidden flex flex-col">
        <div className="flex p-1.5 bg-gray-100 dark:bg-zinc-800/50 m-4 lg:m-6 rounded-2xl">
          <button onClick={() => setMode('PRE')} className={`flex-1 py-3 lg:py-4 rounded-xl font-bold text-xs ${mode === 'PRE' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}><BookOpen size={14} className="inline mr-2"/>아이디어(작성 전)</button>
          <button onClick={() => setMode('POST')} className={`flex-1 py-3 lg:py-4 rounded-xl font-bold text-xs ${mode === 'POST' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}><PenTool size={14} className="inline mr-2"/>본문 분석(작성 후)</button>
        </div>
        
        <div className="px-4 lg:px-10 pb-6 lg:pb-10 flex flex-col space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest"><TypeIcon size={12} className="inline mr-2"/>내용 또는 키워드 입력</label>
            <textarea 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              className="w-full h-32 lg:h-48 p-4 lg:p-6 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl focus:outline-none dark:text-white text-base" 
              placeholder="제목 생성의 기반이 될 내용을 입력하세요..."
            />
          </div>
          <button onClick={handleSuggest} disabled={loading || !input} className="w-full py-4 lg:py-5 bg-blue-600 text-white rounded-2xl font-black shadow-lg active:scale-[0.98] transition-all flex items-center justify-center space-x-2">
            {loading ? <Loader2 className="animate-spin" size={20}/> : <Sparkles size={20}/>}
            <span>추천 제목 생성</span>
          </button>
        </div>
      </div>

      {titles.length > 0 && (
        <div className="space-y-3 animate-fade-in">
          <h3 className="text-[10px] font-black text-gray-400 uppercase px-2">AI 추천 제목</h3>
          {titles.map((title, idx) => (
            <div key={idx} className="group bg-white dark:bg-zinc-900 p-4 lg:p-6 px-6 lg:px-8 rounded-2xl border dark:border-zinc-800 flex items-center justify-between hover:border-blue-500 transition-all">
              <span className="text-base lg:text-lg font-bold dark:text-white leading-snug">{title}</span>
              <button onClick={() => { navigator.clipboard.writeText(title); alert('복사되었습니다.'); }} className="p-2 text-gray-300 hover:text-blue-500 transition-all"><Copy size={16}/></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [tab, setTab] = useState('studio');
  const [darkMode, setDarkMode] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          await syncUser(session.user);
        } else {
          if (!userProfile?.email.includes('guest')) {
            setUserProfile(null);
          }
        }
        setLoading(false);
      });
      return () => subscription.unsubscribe();
    } catch (e) {
      console.error("Auth init error:", e);
      setLoading(false);
    }
  }, [userProfile]);

  const syncUser = async (user: any) => {
    try {
      const { data: profile } = await supabase.from('profiles').select('*').eq('email', user.email).single();
      const isInitialAdmin = user.email === ADMIN_EMAIL;

      if (profile) {
        if (isInitialAdmin && profile.role !== UserRole.ADMIN) {
          const { data: updated } = await supabase.from('profiles')
            .update({ role: UserRole.ADMIN, status: UserStatus.APPROVED })
            .eq('id', user.id)
            .select()
            .single();
          if (updated) setUserProfile(updated as UserProfile);
        } else {
          setUserProfile(profile as UserProfile);
        }
      } else {
        const newProfile = { 
          id: user.id, 
          email: user.email, 
          name: isInitialAdmin ? ADMIN_NAME : (user.user_metadata.full_name || user.email.split('@')[0]), 
          role: isInitialAdmin ? UserRole.ADMIN : UserRole.USER, 
          status: isInitialAdmin ? UserStatus.APPROVED : UserStatus.PENDING 
        };
        const { data } = await supabase.from('profiles').insert(newProfile).select().single();
        if (data) setUserProfile(data as UserProfile);
      }
    } catch (e) {
      console.error("User sync error:", e);
    }
  };

  const handleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ 
        provider: 'google', 
        options: { 
          redirectTo: window.location.origin,
          queryParams: { prompt: 'select_account' }
        } 
      });
      if (error) throw error;
    } catch (e: any) {
      console.error(e);
      alert(`로그인 오류: ${e.message || '인증 서버에 연결할 수 없습니다.'}\n프리뷰 환경에서는 팝업이 차단될 수 있습니다. '게스트 시작'을 이용해 보세요.`);
    }
  };

  const handleGuestLogin = () => {
    setUserProfile({
      email: 'guest@numbers.ai',
      name: '테스트 게스트',
      role: UserRole.USER,
      status: UserStatus.APPROVED
    });
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUserProfile(null);
    } catch (e) {
      setUserProfile(null);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-zinc-950"><Loader2 className="animate-spin text-blue-600" size={48}/></div>;

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 p-6">
        <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-[40px] p-10 lg:p-16 shadow-2xl text-center space-y-10 animate-fade-in relative overflow-hidden">
          <Zap className="text-blue-600 mx-auto fill-blue-600" size={56}/>
          <div className="space-y-2">
            <h1 className="text-3xl font-black dark:text-white tracking-tighter uppercase">AI Newsroom</h1>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Editorial Framework v1.0</p>
          </div>
          <div className="space-y-4">
            <button onClick={handleLogin} className="w-full py-5 bg-zinc-900 dark:bg-blue-600 text-white rounded-[24px] font-black text-lg shadow-xl flex items-center justify-center space-x-4 active:scale-95 transition-all">
              <img src="https://www.google.com/favicon.ico" className="w-5 h-5 bg-white rounded-full p-0.5" alt="g" />
              <span>Google로 로그인</span>
            </button>
            <button onClick={handleGuestLogin} className="w-full py-4 border-2 border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-[24px] font-bold text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all flex items-center justify-center space-x-2">
              <User size={16}/>
              <span>개발자용 게스트 입장</span>
            </button>
          </div>
          <p className="text-[10px] text-gray-400 font-medium">관리자: {ADMIN_NAME} ({ADMIN_EMAIL})</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen ${darkMode ? 'dark' : ''} bg-gray-50 dark:bg-zinc-950 font-sans`}>
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)}/>}
      <aside className={`fixed lg:relative inset-y-0 left-0 w-72 lg:w-80 border-r dark:border-zinc-800 bg-white dark:bg-zinc-900 z-50 transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col p-8 space-y-8`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3"><Zap className="text-blue-600 fill-blue-600" size={24}/><span className="font-black text-xl dark:text-white tracking-tighter uppercase">AI Newsroom</span></div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-zinc-400"><X/></button>
        </div>
        <nav className="flex-1 space-y-2">
          <button onClick={() => {setTab('studio'); setSidebarOpen(false);}} className={`w-full flex items-center space-x-4 px-4 py-3 rounded-xl font-black transition-all ${tab === 'studio' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-inner' : 'text-gray-400 hover:text-zinc-600 dark:hover:text-zinc-200'}`}><PenTool size={18}/><span>편집 스튜디오</span></button>
          <button onClick={() => {setTab('titles'); setSidebarOpen(false);}} className={`w-full flex items-center space-x-4 px-4 py-3 rounded-xl font-black transition-all ${tab === 'titles' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-inner' : 'text-gray-400 hover:text-zinc-600 dark:hover:text-zinc-200'}`}><Sparkles size={18}/><span>제목 추천기</span></button>
          {userProfile.role === UserRole.ADMIN && <button onClick={() => {setTab('admin'); setSidebarOpen(false);}} className={`w-full flex items-center space-x-4 px-4 py-3 rounded-xl font-black transition-all ${tab === 'admin' ? 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 shadow-inner' : 'text-gray-400 hover:text-zinc-600 dark:hover:text-zinc-200'}`}><ShieldCheck size={18}/><span>관리자 센터</span></button>}
        </nav>
        <div className="pt-6 border-t dark:border-zinc-800 space-y-4">
          <div className="flex items-center space-x-3 px-1">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white shadow-lg">{userProfile.name[0]}</div>
            <div className="flex-1 min-w-0"><p className="text-sm font-black dark:text-white truncate">{userProfile.name}</p><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{userProfile.role}</p></div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center space-x-4 px-4 py-3 text-red-500 font-black hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all"><LogOut size={18}/><span>로그아웃</span></button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 lg:h-20 border-b dark:border-zinc-800 flex items-center justify-between px-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-zinc-500"><Menu/></button>
            <div className="hidden lg:flex items-center gap-2">
              <span className="text-xs font-black text-zinc-300 dark:text-zinc-700 uppercase">Numbers AI Framework</span>
              <span className="w-1 h-1 rounded-full bg-zinc-300 dark:zinc-700"></span>
              <span className="text-xs font-black text-blue-600 uppercase">Live</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setDarkMode(!darkMode)} className="p-2.5 text-zinc-400 hover:text-yellow-500 transition-colors">{darkMode ? <Sun size={20}/> : <Moon size={20}/>}</button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 lg:p-10 no-scrollbar">
          {tab === 'studio' && <ArticleStudio stylebook={INITIAL_STYLEBOOK} />}
          {tab === 'titles' && <TitleSuggester stylebook={INITIAL_STYLEBOOK} />}
          {tab === 'admin' && <div className="p-10 text-center space-y-8 animate-fade-in">
            <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/20 rounded-3xl flex items-center justify-center mx-auto text-purple-600">
              <ShieldCheck size={40}/>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black dark:text-white">관리자 패널</h2>
              <p className="text-gray-500 text-sm font-medium">관리자: {ADMIN_NAME} ({ADMIN_EMAIL})</p>
            </div>
            
            <div className="max-w-md mx-auto p-6 bg-white dark:bg-zinc-900 rounded-3xl border dark:border-zinc-800 shadow-lg space-y-4">
              <h3 className="text-sm font-black flex items-center justify-center gap-2"><Github size={16}/> 프로젝트 저장소</h3>
              <a 
                href={REPO_URL} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-800 rounded-2xl border dark:border-zinc-700 hover:border-blue-500 transition-all group"
              >
                <span className="text-xs font-bold text-gray-500 truncate">{REPO_URL}</span>
                <ExternalLink size={14} className="text-gray-400 group-hover:text-blue-500"/>
              </a>
              <p className="text-[10px] text-gray-400 font-medium">실시간 데이터 통계 및 스타일북 편집 기능은 엔터프라이즈 플랜에서 곧 제공될 예정입니다.</p>
            </div>
          </div>}
        </div>
      </main>
    </div>
  );
}