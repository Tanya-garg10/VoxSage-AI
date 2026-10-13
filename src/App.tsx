import React, { useState, useEffect } from 'react';
import { TopNav, ViewType } from './components/TopNav';
import { MainWorkspaceView } from './components/MainWorkspaceView';
import { ReplayImproveStudio } from './components/ReplayImproveStudio';
import { AnalyzeView } from './components/AnalyzeView';
import { DatasetLabView } from './components/DatasetLabView';
import { EvaluationView } from './components/EvaluationView';
import { ProfileView } from './components/ProfileView';
import { fetchDataset, compareAudios } from './services/api';
import { DatasetItem, ContrastiveComparisonResult } from './types';

export default function App() {
  const [activeView, setActiveView] = useState<ViewType>('workspace');
  const [datasetItems, setDatasetItems] = useState<DatasetItem[]>([]);

  // Comparison state
  const [refSampleName, setRefSampleName] = useState<string>('sample_reference_keynote.wav');
  const [compSampleName, setCompSampleName] = useState<string>('sample_flawed_keynote.wav');
  const [refFile, setRefFile] = useState<File | null>(null);
  const [compFile, setCompFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState<string>(
    'Welcome everyone. Today we are fundamentally redefining how humans interact with intelligent multimodal interfaces.'
  );

  const [comparisonResult, setComparisonResult] = useState<ContrastiveComparisonResult | null>(null);
  const [isLoadingComparison, setIsLoadingComparison] = useState(false);
  const [comparisonError, setComparisonError] = useState<string | null>(null);

  // Synchronized flaw seeking & playback state
  const [activeFlawWindow, setActiveFlawWindow] = useState<[number, number] | null>(null);
  const [activeFlawId, setActiveFlawId] = useState<string | null>(null);
  const [seekTime, setSeekTime] = useState<number | null>(null);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState<number>(0);

  // Load dataset and run initial benchmark comparison on mount
  useEffect(() => {
    fetchDataset()
      .then((items) => {
        setDatasetItems(items);
      })
      .catch(() => {});

    runComparison(
      'sample_reference_keynote.wav',
      'sample_flawed_keynote.wav',
      'Welcome everyone. Today we are fundamentally redefining how humans interact with intelligent multimodal interfaces.'
    );
  }, []);

  const runComparison = async (
    overrideRef?: string,
    overrideComp?: string,
    overrideTranscript?: string
  ) => {
    setIsLoadingComparison(true);
    setComparisonError(null);
    setActiveFlawWindow(null);
    setActiveFlawId(null);

    const activeRef = overrideRef || refSampleName;
    const activeComp = overrideComp || compSampleName;
    const activeText = overrideTranscript !== undefined ? overrideTranscript : transcript;

    try {
      const res = await compareAudios({
        referenceFile: refFile || undefined,
        participantFile: compFile || undefined,
        referenceSample: !refFile ? activeRef : undefined,
        participantSample: !compFile ? activeComp : undefined,
        transcript: activeText,
      });
      setComparisonResult(res);
    } catch (err: any) {
      setComparisonError(err.message || 'Contrastive comparison failed.');
    } finally {
      setIsLoadingComparison(false);
    }
  };

  const handleSelectSamplePair = (rSample: string, cSample: string, text: string) => {
    setRefSampleName(rSample);
    setCompSampleName(cSample);
    setTranscript(text);
    setRefFile(null);
    setCompFile(null);
    runComparison(rSample, cSample, text);
  };

  const handleLoadPairInWorkspace = (pair: DatasetItem) => {
    setRefSampleName(pair.referenceAudioFile);
    setCompSampleName(pair.participantAudioFile);
    setTranscript(pair.transcript);
    setRefFile(null);
    setCompFile(null);
    setActiveView('workspace');
    runComparison(pair.referenceAudioFile, pair.participantAudioFile, pair.transcript);
  };

  const handleSeekFlaw = (start: number, end: number, flawId: string) => {
    setSeekTime(start);
    setActiveFlawWindow([start, end]);
    setActiveFlawId(flawId);
  };

  const handleOpenStudio = (start: number, end: number, flawId: string) => {
    setSeekTime(start);
    setActiveFlawWindow([start, end]);
    setActiveFlawId(flawId);
    setActiveView('studio');
  };

  const handleTimeUpdate = (currentTime: number, _duration: number) => {
    setCurrentPlaybackTime(currentTime);
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#242522] flex flex-col font-sans-editorial">
      {/* Top Editorial Navigation */}
      <TopNav
        activeView={activeView}
        onSelectView={setActiveView}
        onOpenNewAnalysis={() => setActiveView('analyze')}
        isAnalyzing={isLoadingComparison}
      />

      {/* Main View Container */}
      <main className="flex-1 px-4 sm:px-8 py-8 overflow-y-auto">
        {activeView === 'workspace' && (
          <MainWorkspaceView
            comparisonResult={comparisonResult}
            datasetItems={datasetItems}
            referenceSampleName={refSampleName}
            comparisonSampleName={compSampleName}
            referenceFile={refFile}
            comparisonFile={compFile}
            onReferenceFileChange={(file) => {
              setRefFile(file);
              setRefSampleName('');
            }}
            onComparisonFileChange={(file) => {
              setCompFile(file);
              setCompSampleName('');
            }}
            onSelectSamplePair={handleSelectSamplePair}
            onRunComparison={() => runComparison()}
            isLoading={isLoadingComparison}
            error={comparisonError}
            activeFlawWindow={activeFlawWindow}
            activeFlawId={activeFlawId}
            seekTime={seekTime}
            currentPlaybackTime={currentPlaybackTime}
            onSeekFlaw={handleSeekFlaw}
            onTimeUpdate={handleTimeUpdate}
            onOpenNewAnalysis={() => setActiveView('analyze')}
            onOpenStudio={handleOpenStudio}
            onNavigateToStudio={() => setActiveView('studio')}
          />
        )}

        {activeView === 'studio' && (
          <ReplayImproveStudio
            comparisonResult={comparisonResult}
            referenceSampleName={refSampleName}
            comparisonSampleName={compSampleName}
            referenceFile={refFile}
            comparisonFile={compFile}
            activeFlawId={activeFlawId}
            onSelectFlaw={handleSeekFlaw}
            onBackToWorkspace={() => setActiveView('workspace')}
          />
        )}

        {activeView === 'analyze' && (
          <AnalyzeView
            onBackToWorkspace={() => setActiveView('workspace')}
            onOpenInComparison={(sampleName, text) => {
              setCompSampleName(sampleName);
              setTranscript(text);
              setActiveView('workspace');
              runComparison(refSampleName, sampleName, text);
            }}
          />
        )}

        {activeView === 'dataset' && (
          <DatasetLabView
            datasetItems={datasetItems}
            onLoadPairInWorkspace={handleLoadPairInWorkspace}
          />
        )}

        {activeView === 'evaluation' && <EvaluationView />}

        {activeView === 'profile' && (
          <ProfileView
            onBackToWorkspace={() => setActiveView('workspace')}
            onOpenAnalysis={() => setActiveView('analyze')}
            onOpenStudio={() => setActiveView('studio')}
          />
        )}
      </main>
    </div>
  );
}
