import React, { useState, useEffect, useRef } from 'react';
import { Camera, MapPin, Edit3, ArrowLeft, Send, Share2, Aperture, Leaf, GalleryVerticalEnd, Wand2, CheckCircle2, Recycle, ArrowRight, X } from 'lucide-react';

// Shadcn/ui componenten voor een strakke look
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

// Dummy data voor de API-aanroep
const MOCK_WASTE_IMAGE_URL = 'https://images0.persgroep.net/rcs/pd4pOVtjvPZpijx0LQrE6pg2-7U/diocontent/14322693/_fitwidth/763?appId=93a17a8fd81db0de025c8abd1cca1279&quality=0.8';

// De hoofdcomponent die de hele applicatie bevat
function App() {
  const [step, setStep] = useState(0); // Start bij stap 0 voor onboarding
  const [melding, setMelding] = useState({
    photo: null,
    location: { lat: 53.2194, lng: 6.5665, address: null },
    wasteType: null,
    funFacts: [],
    contact: { name: '', email: '' },
    reportId: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [time, setTime] = useState(new Date());

  // Update de tijd elke minuut voor de statusbalk van de iPhone
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const goToNextStep = () => {
    setStep(prev => prev + 1);
  }
  const goToPrevStep = () => setStep(prev => prev - 1);
  const goToStep = (targetStep) => setStep(targetStep);

  const resetApp = () => {
    setStep(0);
    setMelding({ photo: null, location: { lat: 53.2194, lng: 6.5665, address: null }, wasteType: null, funFacts: [], contact: { name: '', email: '' }, reportId: null });
    setIsLoading(false);
    setError('');
  };

  const updateMelding = (data) => setMelding(prev => ({ ...prev, ...data }));

  const handleSubmit = () => {
    setIsLoading(true);
    setError('');
    // Simuleert een API-aanroep voor het versturen van de melding
    setTimeout(() => {
      if (Math.random() > 0.1) {
        const reportId = `GR-PLANT-${Date.now().toString().slice(-5)}`;
        updateMelding({ reportId });
        goToNextStep();
      } else {
        setError("Oeps, er ging iets mis bij het versturen.");
      }
      setIsLoading(false);
    }, 3000);
  };

  const steps = [
    <OnboardingStep goToNextStep={goToNextStep} />,
    <PhotoCaptureStep updateMelding={updateMelding} goToStep={goToStep} photo={melding.photo} />,
    <WasteAnalysisStep melding={melding} updateMelding={updateMelding} goToNextStep={goToNextStep} goToPrevStep={() => goToStep(1)} />,
    <LocationPickerStep updateMelding={updateMelding} goToNextStep={goToNextStep} goToPrevStep={goToPrevStep} location={melding.location} />,
    <ReviewStep melding={melding} handleSubmit={handleSubmit} goToPrevStep={goToPrevStep} isLoading={isLoading} error={error} setStep={setStep} />,
    <ConfirmationStep reportId={melding.reportId} resetApp={resetApp} melding={melding} updateMelding={updateMelding} />
  ];

  const currentStepComponent = steps[step];

  // Logic om het juiste step-component te bepalen op basis van de state
  let currentDisplayStep;
  switch(step) {
    case 0:
      currentDisplayStep = <OnboardingStep goToNextStep={goToNextStep} />;
      break;
    case 1:
      currentDisplayStep = <PhotoCaptureStep updateMelding={updateMelding} goToStep={goToStep} photo={melding.photo} />;
      break;
    case 2:
      currentDisplayStep = <WasteAnalysisStep melding={melding} updateMelding={updateMelding} goToNextStep={goToNextStep} goToPrevStep={goToPrevStep} />;
      break;
    case 3:
      currentDisplayStep = <LocationPickerStep updateMelding={updateMelding} goToNextStep={goToNextStep} goToPrevStep={goToPrevStep} location={melding.location} />;
      break;
    case 4:
      currentDisplayStep = <ReviewStep melding={melding} handleSubmit={handleSubmit} goToPrevStep={goToPrevStep} isLoading={isLoading} error={error} setStep={setStep} />;
      break;
    case 5:
      currentDisplayStep = <ConfirmationStep reportId={melding.reportId} resetApp={resetApp} melding={melding} updateMelding={updateMelding} />;
      break;
    default:
      currentDisplayStep = <OnboardingStep goToNextStep={goToNextStep} />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50 font-sans">
      <IphoneFrame>
        <div className="flex flex-col h-full bg-white rounded-[40px] overflow-hidden relative">
          <MovingPattern />
          {/* Statusbalk bovenaan met tijd en netwerkicoon */}
          <div className="flex justify-between items-center h-11 px-6 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
            <span className="font-semibold text-lg">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span className="font-semibold text-lg">4G</span>
          </div>
          {/* Hoofdinhoud van de app met overvloeiende scroll */}
          <div className="flex-1 overflow-hidden relative">
            {step > 0 && <Header step={step} totalSteps={4} currentStepName={getStepName(step)} />}
            <div key={step} className="p-5 pt-0 overflow-y-auto animate-zoom-fade-in-ios h-full">
              {currentDisplayStep}
            </div>
          </div>
          {/* Huisbalk onderaan (iPhone swipe-bar) */}
          <div className="w-full h-8 flex justify-center items-center absolute bottom-0 bg-white/80 backdrop-blur-sm">
            <div className="w-32 h-1 bg-gray-400 rounded-full"></div>
          </div>
        </div>
      </IphoneFrame>
    </div>
  );
}

// Functie voor het aanroepen van de Gemini API voor afvalanalyse
async function fetchWasteDataFromGemini(imageData) {
    const prompt = "Analyseer de bijgevoegde afbeelding van zwerfafval en identificeer het type afval. Genereer ook drie korte, leuke en gepersonaliseerde weetjes over dit specifieke afvaltype. Geef de output als een JSON object met de velden 'wasteType' (string) en 'funFacts' (een array van strings)."
    
    // API-aanroep met de juiste JSON-schema
    const payload = {
        contents: [
            {
                role: "user",
                parts: [
                    { text: prompt },
                    {
                        inlineData: {
                            mimeType: "image/jpeg",
                            data: imageData
                        }
                    }
                ]
            }
        ],
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: "OBJECT",
                properties: {
                    "wasteType": { "type": "STRING" },
                    "funFacts": {
                        "type": "ARRAY",
                        "items": { "type": "STRING" }
                    }
                }
            }
        }
    };
    
    const apiKey = "";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    const retryOptions = { retries: 3, delay: 1000, backoff: 2 };

    for (let i = 0; i <= retryOptions.retries; i++) {
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                if (response.status === 429 && i < retryOptions.retries) {
                    console.warn(`API call failed with status 429. Retrying in ${retryOptions.delay * Math.pow(retryOptions.backoff, i)}ms...`);
                    await new Promise(res => setTimeout(res, retryOptions.delay * Math.pow(retryOptions.backoff, i)));
                    continue;
                }
                throw new Error(`API error: ${response.statusText}`);
            }

            const result = await response.json();
            const jsonText = result?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (jsonText) {
                return JSON.parse(jsonText);
            }
        } catch (err) {
            console.error("Fout bij Gemini API aanroep:", err);
            if (i === retryOptions.retries) {
                return null;
            }
        }
    }
    return null;
}

// Een component om het uiterlijk van een iPhone te simuleren
const IphoneFrame = ({ children }) => (
  <div className="w-[390px] h-[844px] bg-black rounded-[50px] p-[10px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative flex justify-center items-center">
    {/* Het scherm van de telefoon */}
    <div className="w-[370px] h-[804px] bg-gray-100 rounded-[40px] overflow-hidden relative shadow-lg">
      {/* De notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-3xl z-50"></div>
      {children}
    </div>
    {/* Telefoonknoppen */}
    <div className="absolute top-36 -left-1.5 w-1 h-6 bg-gray-600 rounded-full"></div>
    <div className="absolute top-52 -left-1.5 w-1 h-10 bg-gray-600 rounded-full"></div>
    <div className="absolute top-44 -right-1.5 w-1 h-12 bg-gray-600 rounded-full"></div>
  </div>
);

const Header = ({ step, totalSteps, currentStepName }) => {
  const progress = (step / totalSteps) * 100;
  return (
    <div className="flex flex-col items-center space-y-4 px-5 pt-2 mb-6">
      <div className="flex items-center space-x-2 text-green-600 animate-fade-in-long">
        <div className="flex flex-col text-center">
          <h1 className="text-2xl font-bold text-gray-800">Afval Melden</h1>
          <h2 className="text-sm font-medium text-gray-600 mt-[-4px]">Groningen</h2>
        </div>
      </div>
      <h3 className="text-xl font-semibold animate-fade-in-long">{currentStepName}</h3>
      <Progress value={progress} className="w-full h-2 rounded-full [&>div]:bg-green-500 transition-colors duration-700" />
    </div>
  );
};

const getStepName = (step) => {
  const stepNames = {
    1: <><Camera size={20} className="mr-2" /> Foto van het afval</>,
    2: <><Wand2 size={20} className="mr-2" /> Afval analyseren</>,
    3: <><MapPin size={20} className="mr-2" /> Locatie bepalen</>,
    4: <><CheckCircle2 size={20} className="mr-2" /> Overzicht</>,
    5: <><Recycle size={20} className="mr-2" /> Melding verstuurd</>,
  };
  return stepNames[step] || "";
};

const OnboardingStep = ({ goToNextStep }) => (
  <div className="flex flex-col items-center text-center justify-center h-full space-y-8 px-4 animate-fade-in-long">
    <div className="p-8">
        <img src="https://placehold.co/128x128/9AE5BB/000000?text=GRN" alt="Groningen logo" className="rounded-full animate-bounce-slow" />
    </div>
    <h1 className="text-4xl font-bold text-gray-800">Samen maken we Groningen schoon!</h1>
    <p className="text-lg text-gray-600 px-4">Help mee met het melden van zwerfafval in onze stad.</p>
    <Button onClick={goToNextStep} className="w-full py-6 rounded-full bg-green-500 text-white hover:bg-green-600 shadow-lg transition-all duration-700 hover:scale-105" size="lg">
      <span className="text-lg">Meld afval</span>
    </Button>
  </div>
);

const PhotoCaptureStep = ({ updateMelding, goToStep, photo }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  useEffect(() => {
    if (isCameraActive) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.error("Fout bij openen camera:", err);
          setIsCameraActive(false);
        });
    }

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [isCameraActive]);

  const handleCapturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageDataUrl = canvas.toDataURL('image/jpeg');
    
    if (video.srcObject) {
      video.srcObject.getTracks().forEach(track => track.stop());
      video.srcObject = null;
    }
    
    // We slaan de foto op en gaan naar de analyse stap
    updateMelding({ photo: imageDataUrl });
    goToStep(2);
  };
  
  const handleUseMockImage = () => {
    updateMelding({ photo: MOCK_WASTE_IMAGE_URL });
    goToStep(2);
  };

  const handleResetPhoto = () => {
    updateMelding({ photo: null });
    setIsCameraActive(false);
  };

  return (
    <div className="flex flex-col items-center space-y-4 animate-fade-in-long">
      <Card className="w-full rounded-2xl shadow-md">
        <CardContent className="p-4 flex items-center bg-gray-100 rounded-2xl">
          <Leaf size={24} className="text-green-500 mr-2" />
          <p className="text-base text-gray-700 font-medium">Maak een duidelijke foto van het afval.</p>
        </CardContent>
      </Card>
      
      {photo ? (
        <div className="relative w-full h-80 rounded-3xl animate-scale-in-long shadow-md">
          <img src={photo} alt="Bewijsstuk" className="rounded-3xl w-full h-full object-cover transition-all duration-700" />
          <Button variant="ghost" className="absolute top-2 right-2 rounded-full bg-white/70 backdrop-blur-sm p-2 w-10 h-10 text-gray-800 hover:bg-white transition-opacity duration-700" onClick={handleResetPhoto}>
            <X size={20} />
          </Button>
        </div>
      ) : (
        <>
          <div className="relative w-full h-80 bg-gray-200 rounded-3xl overflow-hidden mb-4 animate-scale-in-long shadow-md">
            {isCameraActive ? (
              <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline />
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-full text-gray-400">
                <Camera size={48} />
                <p className="mt-2 text-lg">Cameraweergave</p>
              </div>
            )}
            <canvas ref={canvasRef} className="hidden"></canvas>
          </div>
          {isCameraActive && (
            <Button onClick={handleCapturePhoto} className="w-full py-6 rounded-full bg-green-500 text-white hover:bg-green-600 shadow-lg transition-all duration-700 hover:scale-105" size="lg">
              <Aperture size={20} className="mr-2" />
              <span className="text-lg">Maak foto</span>
            </Button>
          )}
          <Button onClick={() => setIsCameraActive(!isCameraActive)} className="w-full py-4 rounded-full bg-blue-500 text-white hover:bg-blue-600 shadow-lg transition-all duration-700 hover:scale-105" size="lg">
            <span className="text-lg">{isCameraActive ? "Camera sluiten" : "Open camera"}</span>
          </Button>
        </>
      )}

      <Button onClick={handleUseMockImage} variant="outline" className="w-full py-4 rounded-full transition-all duration-700 hover:scale-105" size="lg">
        <GalleryVerticalEnd size={20} className="mr-2" />
        <span className="text-lg">Of gebruik een voorbeeldfoto</span>
      </Button>
    </div>
  );
};

const WasteAnalysisStep = ({ melding, updateMelding, goToNextStep, goToPrevStep }) => {
  const [progress, setProgress] = useState(0);
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const totalDuration = 5000; // API-aanroep en animatie
  const progressInterval = 50;
  
  useEffect(() => {
    if (melding.photo && !melding.wasteType) {
      setIsLoading(true);
      let currentProgress = 0;
      let apiCalled = false;
  
      const progressTimer = setInterval(() => {
        currentProgress += (progressInterval / totalDuration) * 100;
        if (currentProgress >= 100) {
          currentProgress = 100;
          clearInterval(progressTimer);
        }
        setProgress(currentProgress);
      }, progressInterval);

      const fetchData = async () => {
        const base64Image = await fetch(melding.photo)
          .then(response => response.blob())
          .then(blob => {
              return new Promise((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onloadend = () => resolve(reader.result.split(',')[1]);
                  reader.onerror = reject;
                  reader.readAsDataURL(blob);
              });
          }).catch(err => {
            console.error("Fout bij het laden van de afbeelding:", err);
            return null;
          });
          
        let geminiData = null;
        if (base64Image) {
            geminiData = await fetchWasteDataFromGemini(base64Image);
        }

        if (geminiData) {
            updateMelding({ wasteType: geminiData.wasteType, funFacts: geminiData.funFacts });
        } else {
            updateMelding({ wasteType: "Onbekend", funFacts: ["Wist je dat afval scheiden de aarde helpt?", "Elke melding draagt bij aan een schonere buurt."] });
        }

        // Zorg ervoor dat de voortgangsbalk vol is voordat we de status updaten
        const checkProgress = setInterval(() => {
          if (progress >= 99) {
            setAnalysisComplete(true);
            setIsLoading(false);
            clearInterval(checkProgress);
          }
        }, 100);
      };
      
      fetchData();
      
      return () => clearInterval(progressTimer);
    }
  }, [melding.photo]);

  useEffect(() => {
    const factTimer = setInterval(() => {
        if (melding.funFacts && melding.funFacts.length > 0) {
            setCurrentFactIndex(prevIndex => (prevIndex + 1) % melding.funFacts.length);
        }
    }, 2000);

    return () => clearInterval(factTimer);
  }, [melding.funFacts]);

  const currentFact = (melding.funFacts && melding.funFacts.length > 0) ? melding.funFacts[currentFactIndex] : "Een moment geduld, de afvalhelden zijn bezig!";

  return (
    <div className="flex flex-col items-center space-y-4 animate-fade-in-long">
      <Card className="w-full rounded-2xl shadow-md">
        <CardContent className="p-4 flex items-center bg-gray-100 rounded-2xl">
          <Leaf size={24} className="text-green-500 mr-2" />
          <p className="text-base text-gray-700 font-medium">Analyseert de foto...</p>
        </CardContent>
      </Card>
      
      <div className="relative w-full rounded-2xl overflow-hidden mb-4 animate-scale-in-long shadow-md">
        <img src={melding.photo} alt="Afval om te analyseren" className="w-full h-auto object-cover" />
        
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-white/50 backdrop-blur-sm z-10">
            <div className="w-16 h-16 border-4 border-dashed rounded-full border-green-500 animate-spin-slow"></div>
            <p className="text-base text-gray-600 text-center font-medium mt-4 max-w-[200px] text-lg animate-[fact-fade-in-out_2s_ease-in-out_infinite]">{currentFact}</p>
          </div>
        )}

        {analysisComplete && (
          <>
            <div className="absolute inset-0 bg-green-500/20 backdrop-blur-sm animate-segmentation-overlay"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Badge className="text-lg bg-white text-gray-800 rounded-full py-2 px-4 shadow-xl">
                {melding.wasteType}
              </Badge>
            </div>
          </>
        )}
        
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
          <div className="h-full bg-green-500 transition-all duration-700 ease-linear" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <Button onClick={goToNextStep} disabled={!analysisComplete} className="w-full py-6 rounded-full bg-green-500 text-white hover:bg-green-600 shadow-lg transition-all duration-700 hover:scale-105" size="lg">
        <span className="text-lg">Volgende stap</span>
      </Button>
      <Button onClick={goToPrevStep} variant="outline" disabled={isLoading} className="w-full py-4 rounded-full transition-all duration-700 hover:scale-105">
        <ArrowLeft size={20} className="mr-2" />
        <span className="text-lg">Terug</span>
      </Button>
    </div>
  );
};


const LocationPickerStep = ({ updateMelding, goToNextStep, goToPrevStep, location }) => {
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(true);

  // Laadt de Google Maps API-script
  const loadMapScript = () => {
    if (window.google) {
      setMapLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.onload = () => {
      setMapLoaded(true);
    };
    script.onerror = () => {
      console.error('Fout bij het laden van de kaartscript.');
    };
    document.head.appendChild(script);
  };

  // Vindt de locatie van de gebruiker met de Geolocation API
  const findUserLocation = () => {
    if (!navigator.geolocation) {
      console.error('Geolocation wordt niet ondersteund.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        updateMelding({ location: { ...userLocation, address: 'Locatie wordt opgehaald...' } });
        initMap(userLocation);
      },
      (error) => {
        console.error(`Fout bij het ophalen van locatie: ${error.message}`);
        updateMelding({ location: { ...location, address: 'Locatie kon niet worden opgehaald.' } });
      }
    );
  };

  // Initialiseert de kaart en voegt een marker toe
  const initMap = (userLocation) => {
    if (!window.google) return;
    const map = new window.google.maps.Map(mapRef.current, {
      center: userLocation,
      zoom: 15,
      disableDefaultUI: true,
    });
    new window.google.maps.Marker({ position: userLocation, map: map, title: 'Uw locatie', });
    getAddressFromCoords(userLocation);
  };

  // Haalt het adres op basis van de coördinaten
  const getAddressFromCoords = (userLocation) => {
    if (!window.google || !userLocation) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: userLocation }, (results, status) => {
      if (status === 'OK' && results[0]) {
        updateMelding({ location: { ...userLocation, address: results[0].formatted_address } });
        setIsProcessing(false);
      } else {
        updateMelding({ location: { ...userLocation, address: 'Adres kon niet worden opgehaald.' } });
        setIsProcessing(false);
      }
    });
  };

  // Geautomatiseerde flow
  useEffect(() => {
    const steps = [
      { text: "Kaart wordt geladen...", duration: 2000, action: () => loadMapScript() },
      { text: "Uw locatie wordt gezocht...", duration: 2500, action: () => findUserLocation() },
    ];
    let stepIndex = 0;
    
    const runFlow = () => {
      if (stepIndex >= steps.length) {
        return;
      }
      
      const { duration, action } = steps[stepIndex];
      
      // Update de voortgang
      const progressValue = ((stepIndex + 1) / steps.length) * 100;
      const progressInterval = setInterval(() => {
        setCurrentProgress(prev => Math.min(prev + 1, progressValue));
      }, 50);

      setTimeout(() => {
        action();
        clearInterval(progressInterval);
        stepIndex++;
        runFlow();
      }, duration);
    };

    runFlow();
  }, []);

  return (
    <div className="flex flex-col items-center space-y-4 animate-fade-in-long">
      <Card className="w-full rounded-2xl shadow-md">
        <CardContent className="p-4 flex items-center bg-gray-100 rounded-2xl">
          <Leaf size={24} className="text-green-500 mr-2" />
          <p className="text-base text-gray-700 font-medium">Vind de locatie van het afval.</p>
        </CardContent>
      </Card>
      <div className="relative w-full h-80 rounded-2xl overflow-hidden animate-scale-in-long shadow-md">
        <div ref={mapRef} className="h-full w-full bg-gray-200">
          {!mapLoaded && (
            <div className="flex items-center justify-center h-full text-gray-500">
              Kaart laadt...
            </div>
          )}
        </div>
        <Progress value={currentProgress} className="absolute bottom-0 w-full h-1 rounded-none [&>div]:bg-green-500 transition-all duration-700" />
      </div>
      
      <Card className="w-full rounded-2xl shadow-md">
        <CardContent className="p-4 flex items-center bg-blue-100 rounded-2xl">
          <MapPin size={20} className="text-blue-600 mr-2" />
          <span className="text-base font-medium">{location.address || "Zoeken naar locatie..."}</span>
        </CardContent>
      </Card>

      <Button onClick={goToNextStep} disabled={!location.address || isProcessing} className="w-full py-6 rounded-full bg-green-500 text-white hover:bg-green-600 shadow-lg transition-all duration-700 hover:scale-105" size="lg">
        <span className="text-lg">Locatie bevestigen</span>
      </Button>

      <Button onClick={goToPrevStep} variant="outline" className="w-full py-4 rounded-full transition-all duration-700 hover:scale-105">
        <ArrowLeft size={20} className="mr-2" />
        <span className="text-lg">Terug</span>
      </Button>
    </div>
  );
};

const ReviewStep = ({ melding, handleSubmit, goToPrevStep, isLoading, error, setStep }) => {
  return (
    <div className="flex flex-col items-center space-y-4 animate-fade-in-long pb-16">
      <Card className="w-full rounded-2xl shadow-md">
        <CardContent className="p-4 flex items-center bg-gray-100 rounded-2xl">
          <Leaf size={24} className="text-green-500 mr-2" />
          <p className="text-base text-gray-700 font-medium">Controleer nog even of alles klopt.</p>
        </CardContent>
      </Card>
      
      <Card className="w-full rounded-2xl shadow-md">
        <CardHeader className="p-4 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-medium">Bewijsstuk</CardTitle>
          <Button onClick={() => setStep(1)} variant="link" className="text-blue-600 p-0 h-auto text-base">Wijzigen</Button>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <img src={melding.photo} alt="Zwerfafval" className="rounded-3xl w-full h-auto object-cover" />
        </CardContent>
      </Card>

      <Card className="w-full rounded-2xl shadow-md">
        <CardHeader className="p-4 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-medium">Locatie</CardTitle>
          <Button onClick={() => setStep(3)} variant="link" className="text-blue-600 p-0 h-auto text-base">Wijzigen</Button>
        </CardHeader>
        <CardContent className="p-4 pt-0 flex items-center space-x-2">
          <MapPin size={16} className="text-blue-600" />
          <p className="text-base">{melding.location.address}</p>
        </CardContent>
      </Card>

      <Card className="w-full rounded-2xl shadow-md">
        <CardHeader className="p-4">
          <CardTitle className="text-base font-medium">Soort afval</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-100 rounded-full text-base">
            {melding.wasteType}
          </Badge>
        </CardContent>
      </Card>

      {error && (
        <Card className="w-full rounded-2xl border-l-4 border-red-500 bg-red-50 text-red-700 shadow-md">
          <CardContent className="p-3">
            <p className="text-base">{error}</p>
          </CardContent>
        </Card>
      )}

      <Button onClick={handleSubmit} disabled={isLoading} className="w-full py-6 rounded-full bg-green-500 text-white hover:bg-green-600 shadow-lg transition-all duration-700 hover:scale-105" size="lg">
        {isLoading ? (
          <span className="text-lg">Versturen...</span>
        ) : (
          <>
            <Send size={20} className="mr-2" />
            <span className="text-lg">Melding verzenden</span>
          </>
        )}
      </Button>
      <Button onClick={goToPrevStep} variant="outline" disabled={isLoading} className="w-full py-4 rounded-full transition-all duration-700 hover:scale-105">
        <ArrowLeft size={20} className="mr-2" />
        <span className="text-lg">Terug</span>
      </Button>
    </div>
  );
};

const ConfirmationStep = ({ reportId, resetApp, melding, updateMelding }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [contactInfo, setContactInfo] = useState(melding.contact);
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);

  const handleSaveContact = () => {
    setIsSubmittingContact(true);
    // Simuleer een API-aanroep
    setTimeout(() => {
      updateMelding({ contact: contactInfo });
      setIsSubmittingContact(false);
      setIsDialogOpen(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center text-center space-y-6 animate-fade-in-long pb-16">
      <div className="p-8">
        <CheckCircle2 className="w-32 h-32 text-green-600 animate-bounce-slow" />
      </div>
      <h1 className="text-3xl font-bold">Bedankt, Afvalheld!</h1>
      <p className="text-base text-gray-600">Jouw actie maakt het verschil. Dankzij jou is Groningen weer een stukje mooier.</p>
      
      <Card className="w-full rounded-2xl shadow-md">
        <CardContent className="p-4 bg-gray-100 rounded-2xl">
          <p className="text-base text-gray-600 mb-1">Jouw meldings-ID:</p>
          <p className="text-xl font-bold break-all">{reportId}</p>
        </CardContent>
      </Card>
      
      {/* De nieuwe knop en dialoog voor contactgegevens */}
      <Button onClick={() => setIsDialogOpen(true)} className="w-full py-6 rounded-full bg-blue-500 text-white hover:bg-blue-600 shadow-lg transition-all duration-700 hover:scale-105" size="lg">
        <span className="text-lg">Houd mij op de hoogte</span>
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Blijf op de hoogte!</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-1">
              <Label htmlFor="contact-name" className="text-sm font-medium">Naam</Label>
              <Input
                id="contact-name"
                value={contactInfo.name}
                onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
                placeholder="Jan Jansen"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="contact-email" className="text-sm font-medium">E-mailadres</Label>
              <Input
                id="contact-email"
                type="email"
                value={contactInfo.email}
                onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                placeholder="jan.jansen@voorbeeld.nl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveContact} disabled={isSubmittingContact}>
              {isSubmittingContact ? "Opslaan..." : "Opslaan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Button onClick={resetApp} className="w-full py-6 rounded-full bg-green-500 text-white hover:bg-green-600 shadow-lg transition-all duration-700 hover:scale-105" size="lg">
        <span className="text-lg">Nieuwe melding maken</span>
      </Button>
      <Button variant="outline" className="w-full py-6 rounded-full transition-all duration-700 hover:scale-105" size="lg">
        <Share2 size={20} className="mr-2" />
        <span className="text-lg">Deel je prestatie</span>
      </Button>
    </div>
  );
};

// Een component voor de subtiele bewegende stippenpatroon achtergrond
const MovingPattern = () => {
  const items = Array.from({ length: 50 }).map((_, i) => (
    <div
      key={i}
      className="absolute rounded-full bg-blue-200/40"
      style={{
        width: `${Math.random() * 8 + 4}px`,
        height: `${Math.random() * 8 + 4}px`,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        animation: `subtle-move 20s infinite ease-in-out alternate-reverse`,
        animationDelay: `-${Math.random() * 10}s`,
      }}
    ></div>
  ));

  return (
    <>
      <style>
        {`
        @keyframes subtle-move {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(15px, 15px) scale(1.1); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes fade-in-long {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fact-fade-in-out {
          0%, 100% { opacity: 0; transform: translateY(10px); }
          5%, 95% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-long { animation: fade-in-long 0.7s ease-out; }
        .animate-scale-in-long { animation: scale-in-long 0.7s ease-out; }
        @keyframes scale-in-long {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes zoom-fade-in-ios {
          0% {
              opacity: 0;
              transform: scale(1.05) translateY(10px);
          }
          100% {
              opacity: 1;
              transform: scale(1) translateY(0);
          }
        }
        .animate-zoom-fade-in-ios {
            animation: zoom-fade-in-ios 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s infinite ease-in-out;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15%); }
        }
        .animate-spin-slow {
          animation: spin-slow 2s linear infinite;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-segmentation-overlay {
          animation: segmentation-overlay 2s ease-out forwards;
          clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
        }
        @keyframes segmentation-overlay {
          0% { clip-path: polygon(0 100%, 100% 100%, 100% 100%, 0% 100%); }
          100% { clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%); }
        }
        `}
      </style>
      <div className="absolute inset-0 overflow-hidden -z-10">
        {items}
      </div>
    </>
  );
};

export default App;
