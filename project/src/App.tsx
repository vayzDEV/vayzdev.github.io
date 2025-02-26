import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, AlertCircle, Download, Settings, Info, HelpCircle, AudioWaveform, Languages } from 'lucide-react';
import { translations, Language } from './translations';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [volume, setVolume] = useState(0);
  const [frequency, setFrequency] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showSetup, setShowSetup] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [language, setLanguage] = useState<Language>('ru');
  const [soundSource, setSoundSource] = useState<string>('unknown');
  const [frequencyRanges, setFrequencyRanges] = useState({
    low: 0,
    mid: 0,
    high: 0
  });
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const t = translations[language];

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', () => {});
    };
  }, []);

  const installApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  const analyzeSoundSource = (frequencies: Float32Array) => {
    // Simple frequency-based classification
    const avgFreq = frequencies.reduce((a, b) => a + b, 0) / frequencies.length;
    
    if (frequency >= 85 && frequency <= 255) {
      return t.analysis.human;
    } else if (frequency >= 1000 && frequency <= 8000) {
      return t.analysis.bird;
    } else if (frequency >= 40 && frequency <= 60) {
      return t.analysis.dog;
    } else if (frequency >= 60 && frequency <= 80) {
      return t.analysis.cat;
    }
    return t.analysis.unknown;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      analyserRef.current.fftSize = 2048;
      
      setIsRecording(true);
      setError(null);
      setShowSetup(false);
      
      analyzeAudio();
    } catch (err) {
      setError(t.error);
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setIsRecording(false);
    setVolume(0);
    setFrequency(0);
    setSoundSource(t.analysis.unknown);
    setFrequencyRanges({ low: 0, mid: 0, high: 0 });
  };

  const analyzeAudio = () => {
    if (!analyserRef.current || !isRecording) return;

    const timeDataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    const frequencyDataArray = new Float32Array(analyserRef.current.frequencyBinCount);
    
    const analyze = () => {
      if (!isRecording || !analyserRef.current || !audioContextRef.current) return;
      
      analyserRef.current.getByteTimeDomainData(timeDataArray);
      let sum = 0;
      for (let i = 0; i < timeDataArray.length; i++) {
        sum += Math.abs(timeDataArray[i] - 128);
      }
      const averageVolume = sum / timeDataArray.length;
      setVolume(Math.round((averageVolume / 128) * 100));

      analyserRef.current.getFloatFrequencyData(frequencyDataArray);
      
      // Analyze frequency ranges
      const ranges = {
        low: 0,
        mid: 0,
        high: 0
      };

      for (let i = 0; i < frequencyDataArray.length; i++) {
        const frequency = i * audioContextRef.current.sampleRate / analyserRef.current.frequencyBinCount;
        const magnitude = Math.pow(10, frequencyDataArray[i] / 20);
        
        if (frequency < 250) {
          ranges.low += magnitude;
        } else if (frequency < 2000) {
          ranges.mid += magnitude;
        } else {
          ranges.high += magnitude;
        }
      }

      setFrequencyRanges(ranges);
      
      // Find dominant frequency
      let maxIndex = 0;
      let maxValue = -Infinity;
      for (let i = 0; i < frequencyDataArray.length; i++) {
        if (frequencyDataArray[i] > maxValue) {
          maxValue = frequencyDataArray[i];
          maxIndex = i;
        }
      }
      
      const dominantFrequency = Math.round((maxIndex * audioContextRef.current.sampleRate) / (2 * frequencyDataArray.length));
      setFrequency(dominantFrequency);
      
      // Analyze sound source
      setSoundSource(analyzeSoundSource(frequencyDataArray));

      requestAnimationFrame(analyze);
    };

    analyze();
  };

  useEffect(() => {
    return () => {
      if (isRecording) {
        stopRecording();
      }
    };
  }, [isRecording]);

  const SetupGuide = () => (
    <div className="space-y-6 bg-blue-50 p-6 rounded-xl">
      <div className="flex items-start gap-4">
        <div className="bg-blue-500 p-2 rounded-full">
          <Info className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-blue-900">{t.setup.title}</h3>
          <p className="text-blue-700 mt-1">{t.setup.description}</p>
        </div>
      </div>
      
      <div className="space-y-4 pl-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-semibold">1</div>
          <p className="text-blue-800">{t.setup.step1}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-semibold">2</div>
          <p className="text-blue-800">{t.setup.step2}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-semibold">3</div>
          <p className="text-blue-800">{t.setup.step3}</p>
        </div>
      </div>

      <button
        onClick={() => setShowSetup(false)}
        className="w-full mt-4 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
      >
        {t.setup.understand}
      </button>
    </div>
  );

  const SettingsPanel = () => (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">{t.settings}</h3>
        <button
          onClick={() => setShowSettings(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.language}
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setLanguage('ru')}
              className={`px-4 py-2 rounded ${
                language === 'ru'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Русский
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-4 py-2 rounded ${
                language === 'en'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              English
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-4">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <AudioWaveform className="w-8 h-8 text-blue-500" />
              <h1 className="text-3xl font-bold text-gray-800">
                {t.title}
              </h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                title={t.settings}
              >
                <Settings size={24} />
              </button>
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                title={t.about.title}
              >
                <HelpCircle size={24} />
              </button>
              {deferredPrompt && (
                <button
                  onClick={installApp}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                >
                  <Download size={20} />
                  <span>{t.install}</span>
                </button>
              )}
            </div>
          </div>

          {showSettings && <SettingsPanel />}

          {error && (
            <div className="mb-6 p-4 bg-red-50 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle size={20} />
              <p>{error}</p>
            </div>
          )}

          {showSetup && <SetupGuide />}

          {showInfo && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2 text-gray-800">{t.about.title}</h3>
              <p className="text-gray-600">{t.about.description}</p>
            </div>
          )}

          <div className="flex justify-center mb-8">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`p-6 rounded-full transition-all transform hover:scale-105 ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isRecording ? (
                <MicOff className="w-8 h-8 text-white" />
              ) : (
                <Mic className="w-8 h-8 text-white" />
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-700 font-medium text-lg">{t.volume}</span>
                <Volume2 className="w-6 h-6 text-gray-600" />
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all duration-200"
                  style={{ width: `${volume}%` }}
                />
              </div>
              <div className="mt-2 text-right text-sm font-medium text-gray-600">
                {volume}%
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-700 font-medium text-lg">{t.frequency}</span>
                <span className="text-sm font-medium text-gray-500">Hz</span>
              </div>
              <div className="text-3xl font-bold text-center text-gray-800">
                {frequency} Hz
              </div>
              <div className="mt-2 text-center text-sm text-gray-500">
                {frequency < 20 ? t.soundType.infrasound : 
                 frequency > 20000 ? t.soundType.ultrasound : 
                 t.soundType.audible}
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-gray-700 font-medium text-lg mb-4">{t.ranges.title}</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>{t.ranges.low}</span>
                    <span>{Math.round(frequencyRanges.low * 100)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-200"
                      style={{ width: `${Math.round(frequencyRanges.low * 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>{t.ranges.mid}</span>
                    <span>{Math.round(frequencyRanges.mid * 100)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 transition-all duration-200"
                      style={{ width: `${Math.round(frequencyRanges.mid * 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>{t.ranges.high}</span>
                    <span>{Math.round(frequencyRanges.high * 100)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 transition-all duration-200"
                      style={{ width: `${Math.round(frequencyRanges.high * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-gray-700 font-medium text-lg mb-4">{t.analysis.title}</h3>
              <div className="text-2xl font-semibold text-center text-gray-800">
                {soundSource}
              </div>
            </div>
          </div>

          {isRecording && (
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <p>{t.recording}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;