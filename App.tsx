
import React, { useState, useEffect } from 'react';
import { AppStep, SessionState, ImageSize, PromptMode, CreativeDirection, ShotType } from './types';
import { Button } from './components/Button';
import { ImageUpload } from './components/ImageUpload';
import { analyzeImagesAndGeneratePrompt, generateCommercialImage } from './services/geminiService';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.UPLOAD);
  const [state, setState] = useState<SessionState>({
    productImage: null,
    modelImage: null,
    selectedSize: null,
    promptMode: null,
    userPrompt: null,
    systemPrompt: null,
    creativeDirection: null,
    shotType: null,
    generatedImageUrl: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateState = (updates: Partial<SessionState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const handleReset = () => {
    setState({
      productImage: null,
      modelImage: null,
      selectedSize: null,
      promptMode: null,
      userPrompt: null,
      systemPrompt: null,
      creativeDirection: null,
      shotType: null,
      generatedImageUrl: null,
    });
    setStep(AppStep.UPLOAD);
    setError(null);
  };

  const handleUploadComplete = () => {
    if (state.productImage && state.modelImage) {
      setStep(AppStep.SIZE_SELECTION);
    }
  };

  const selectSize = (size: ImageSize) => {
    updateState({ selectedSize: size });
    setStep(AppStep.MODE_SELECTION);
  };

  const selectMode = (mode: PromptMode) => {
    updateState({ promptMode: mode });
    if (mode === PromptMode.USER) {
      setStep(AppStep.USER_PROMPT_INPUT);
    } else {
      setStep(AppStep.SYSTEM_DIRECTION);
    }
  };

  const handleSystemDirection = async (direction: CreativeDirection) => {
    setLoading(true);
    setError(null);
    try {
      const prompt = await analyzeImagesAndGeneratePrompt(
        state.productImage!,
        state.modelImage!,
        direction
      );
      updateState({ creativeDirection: direction, systemPrompt: prompt });
      setStep(AppStep.PROMPT_PREVIEW);
    } catch (err: any) {
      setError("Failed to analyze images. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const proceedToShotType = () => {
    setStep(AppStep.SHOT_TYPE);
  };

  const generateImage = async (shotType: ShotType) => {
    setLoading(true);
    setError(null);
    updateState({ shotType });
    setStep(AppStep.GENERATING);

    try {
      const finalPrompt = state.promptMode === PromptMode.USER 
        ? state.userPrompt! 
        : state.systemPrompt!;
      
      const imageUrl = await generateCommercialImage(
        finalPrompt,
        state.selectedSize!,
        state.productImage,
        state.modelImage,
        shotType
      );
      updateState({ generatedImageUrl: imageUrl });
      setStep(AppStep.RESULT);
    } catch (err: any) {
      setError("Failed to generate image. Please try again.");
      setStep(AppStep.RESULT); // Or go back to retry
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <div className="text-center mb-12">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-violet-500 bg-clip-text text-transparent mb-2">
        Creative Director AI
      </h1>
      <p className="text-slate-400 text-lg">Premium Commercial Asset Studio</p>
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case AppStep.UPLOAD:
        return (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ImageUpload 
                label="Product Image" 
                preview={state.productImage} 
                onUpload={(b64) => updateState({ productImage: b64 })} 
                icon="fa-solid fa-bottle-water"
              />
              <ImageUpload 
                label="Model Image" 
                preview={state.modelImage} 
                onUpload={(b64) => updateState({ modelImage: b64 })} 
                icon="fa-solid fa-user-tie"
              />
            </div>
            <div className="flex justify-center pt-4">
              <Button 
                onClick={handleUploadComplete} 
                disabled={!state.productImage || !state.modelImage}
                className="w-full md:w-64"
              >
                Save Assets & Continue
              </Button>
            </div>
          </div>
        );

      case AppStep.SIZE_SELECTION:
        return (
          <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-semibold text-center text-white">Select output image size</h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.values(ImageSize).map(size => (
                <Button key={size} variant="outline" onClick={() => selectSize(size)} className="h-24">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-lg font-bold">{size}</span>
                    <span className="text-xs text-slate-500">
                      {size === ImageSize.SQUARE && "Square"}
                      {size === ImageSize.PORTRAIT && "Portrait (4:5)"}
                      {size === ImageSize.REEL && "Reel / Story (9:16)"}
                      {size === ImageSize.LANDSCAPE && "Landscape (16:9)"}
                    </span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        );

      case AppStep.MODE_SELECTION:
        return (
          <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-semibold text-center text-white">How would you like to generate images?</h2>
            <div className="flex flex-col gap-4">
              <Button onClick={() => selectMode(PromptMode.USER)} variant="outline" className="justify-between">
                <span>I will provide my own prompt</span>
                <i className="fa-solid fa-keyboard opacity-50"></i>
              </Button>
              <Button onClick={() => selectMode(PromptMode.SYSTEM)} variant="primary" className="justify-between">
                <span>System generates creative prompts for me</span>
                <i className="fa-solid fa-wand-magic-sparkles"></i>
              </Button>
            </div>
          </div>
        );

      case AppStep.USER_PROMPT_INPUT:
        return (
          <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-semibold text-white">Paste your prompt here</h2>
            <textarea 
              className="w-full h-40 bg-slate-800 border border-slate-700 rounded-xl p-4 text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              placeholder="e.g. A futuristic watch being worn by a sleek model in a cyberpunk neon-lit street..."
              value={state.userPrompt || ''}
              onChange={(e) => updateState({ userPrompt: e.target.value })}
            />
            <div className="flex gap-4">
              <Button onClick={() => setStep(AppStep.MODE_SELECTION)} variant="ghost" className="flex-1">Cancel</Button>
              <Button 
                onClick={proceedToShotType} 
                variant="primary" 
                className="flex-1"
                disabled={!state.userPrompt?.trim()}
              >
                Proceed to Shot Type
              </Button>
            </div>
          </div>
        );

      case AppStep.SYSTEM_DIRECTION:
        return (
          <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-semibold text-center text-white">Select creative direction</h2>
            <div className="grid grid-cols-1 gap-3">
              {Object.values(CreativeDirection).map(dir => (
                <Button key={dir} variant="outline" onClick={() => handleSystemDirection(dir)} disabled={loading} className="justify-start">
                  {loading && state.creativeDirection === dir ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-star-of-life text-indigo-400"></i>}
                  {dir}
                </Button>
              ))}
            </div>
            {loading && <p className="text-center text-slate-400 animate-pulse">Analyzing visual assets...</p>}
          </div>
        );

      case AppStep.PROMPT_PREVIEW:
        return (
          <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">Creative prompt ready.</h2>
              <span className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-indigo-500/20">System Mode</span>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 italic text-slate-300 leading-relaxed shadow-inner">
              "{state.systemPrompt}"
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <Button onClick={() => handleSystemDirection(state.creativeDirection!)} variant="secondary" className="flex-1">
                <i className="fa-solid fa-arrows-rotate"></i> Regenerate Prompt
              </Button>
              <Button onClick={() => setStep(AppStep.MODE_SELECTION)} variant="ghost">Cancel</Button>
              <Button onClick={proceedToShotType} variant="primary" className="flex-1">
                Next: Shot Type Selection
              </Button>
            </div>
          </div>
        );

      case AppStep.SHOT_TYPE:
        return (
          <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-semibold text-center text-white">Select shot type</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.values(ShotType).map(st => (
                <Button key={st} variant="outline" onClick={() => generateImage(st)} className="h-28">
                   <div className="flex flex-col items-center text-center">
                    <span className="font-semibold">{st.split(' / ')[0]}</span>
                    <span className="text-xs text-slate-500">{st.split(' / ')[1]}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        );

      case AppStep.GENERATING:
        return (
          <div className="flex flex-col items-center justify-center min-h-[400px] animate-pulse">
            <div className="relative mb-8">
              <div className="w-24 h-24 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
              <i className="fa-solid fa-camera-retro absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl text-indigo-400"></i>
            </div>
            <h3 className="text-2xl font-bold mb-2">Composing Commercial Masterpiece</h3>
            <p className="text-slate-400">Our AI creative team is rendering your vision...</p>
            <div className="mt-8 flex gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></div>
            </div>
          </div>
        );

      case AppStep.RESULT:
        return (
          <div className="max-w-4xl mx-auto space-y-8 animate-in zoom-in-95 duration-700">
            {error ? (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-8 text-center">
                <i className="fa-solid fa-triangle-exclamation text-4xl text-rose-500 mb-4"></i>
                <h3 className="text-xl font-bold text-white mb-2">Generation Failed</h3>
                <p className="text-slate-400 mb-6">{error}</p>
                <Button onClick={() => setStep(AppStep.SHOT_TYPE)}>Retry Shot Selection</Button>
              </div>
            ) : (
              <>
                <div className="relative group bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border border-slate-700 mx-auto max-w-lg">
                  <img 
                    src={state.generatedImageUrl!} 
                    alt="Generated Commercial" 
                    className="w-full h-auto object-contain"
                  />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button 
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = state.generatedImageUrl!;
                        link.download = 'creative-asset.png';
                        link.click();
                      }}
                      className="w-10 h-10 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-md"
                    >
                      <i className="fa-solid fa-download"></i>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold text-center text-white">Generate next image?</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                    <Button onClick={() => generateImage(state.shotType!)} variant="secondary">
                      <i className="fa-solid fa-rotate"></i> Yes – Same Prompt
                    </Button>
                    <Button onClick={() => setStep(AppStep.SHOT_TYPE)} variant="secondary">
                      <i className="fa-solid fa-clapperboard"></i> Yes – New Shot Type
                    </Button>
                    <Button onClick={() => setStep(AppStep.MODE_SELECTION)} variant="secondary">
                      <i className="fa-solid fa-wand-sparkles"></i> Yes – New Creative Prompt
                    </Button>
                    <Button onClick={() => setStep(AppStep.SESSION_END)} variant="danger">
                      <i className="fa-solid fa-power-off"></i> No – End Session
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        );

      case AppStep.SESSION_END:
        return (
          <div className="max-w-xl mx-auto text-center py-20 animate-in fade-in zoom-in-90 duration-500">
            <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-indigo-500/20">
              <i className="fa-solid fa-check text-3xl text-indigo-400"></i>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Session completed.</h2>
            <p className="text-slate-400 mb-8 text-lg">Your creative assets have been prepared. You can restart the engine anytime to build more campaigns.</p>
            <Button onClick={handleReset} variant="primary" className="mx-auto">
              Start New Project
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pb-20 pt-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {renderHeader()}
        
        {/* Navigation Breadcrumbs / Progress */}
        {step !== AppStep.SESSION_END && (
          <div className="flex justify-center mb-12 overflow-x-auto no-scrollbar py-2">
            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap">
              <span className={step === AppStep.UPLOAD ? "text-indigo-400" : "text-slate-600"}>Upload</span>
              <i className="fa-solid fa-chevron-right text-[10px] opacity-30"></i>
              <span className={step === AppStep.SIZE_SELECTION ? "text-indigo-400" : "text-slate-600"}>Size</span>
              <i className="fa-solid fa-chevron-right text-[10px] opacity-30"></i>
              <span className={[AppStep.MODE_SELECTION, AppStep.USER_PROMPT_INPUT, AppStep.SYSTEM_DIRECTION, AppStep.PROMPT_PREVIEW].includes(step) ? "text-indigo-400" : "text-slate-600"}>Creative</span>
              <i className="fa-solid fa-chevron-right text-[10px] opacity-30"></i>
              <span className={step === AppStep.SHOT_TYPE ? "text-indigo-400" : "text-slate-600"}>Shot</span>
              <i className="fa-solid fa-chevron-right text-[10px] opacity-30"></i>
              <span className={[AppStep.GENERATING, AppStep.RESULT].includes(step) ? "text-indigo-400" : "text-slate-600"}>Production</span>
            </div>
          </div>
        )}

        <main className="relative">
          {renderStep()}
        </main>

        {/* Floating Reset Button */}
        {![AppStep.UPLOAD, AppStep.SESSION_END].includes(step) && (
          <button 
            onClick={handleReset}
            className="fixed bottom-8 left-8 p-4 bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition-all border border-slate-700 backdrop-blur-md shadow-xl"
            title="Start Over"
          >
            <i className="fa-solid fa-arrow-rotate-left"></i>
          </button>
        )}
      </div>
    </div>
  );
};

export default App;
