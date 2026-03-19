import { useState, useRef, useEffect } from "react";
import { useCanPlayStopwatch, useSubmitStopwatchAttempt, useGetStopwatchWinners } from "@workspace/api-client-react";
import { Trophy, Timer, Play, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";

export function StopwatchSection() {
  const { data: canPlayStatus, isLoading: checkLoading } = useCanPlayStopwatch({ ip: 'guest' }); // In real app, IP resolved on backend
  const { data: winners } = useGetStopwatchWinners({ limit: 5 });
  const submitAttempt = useSubmitStopwatchAttempt();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  
  // Stopwatch logic
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const startTimeRef = useRef<number>(0);
  const reqRef = useRef<number>(0);

  const updateTime = () => {
    setTime(Date.now() - startTimeRef.current);
    reqRef.current = requestAnimationFrame(updateTime);
  };

  const handleStart = () => {
    if (!name.trim()) {
      toast({ title: "Name required", description: "Please enter your name to play.", variant: "destructive" });
      return;
    }
    setIsPlaying(true);
    setRunning(true);
    startTimeRef.current = Date.now();
    reqRef.current = requestAnimationFrame(updateTime);
  };

  const handleStop = async () => {
    cancelAnimationFrame(reqRef.current);
    setRunning(false);
    setHasPlayed(true);
    
    // Stop exactly here
    const finalTime = time;
    const finalSeconds = finalTime / 1000;
    
    try {
      const result = await submitAttempt.mutateAsync({
        data: { userName: name, timeStopped: finalSeconds, ipAddress: "guest" }
      });

      if (result.isWinner) {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#E63946', '#FFCA3A'] });
        toast({
          title: "🎉 YOU WON! 🎉",
          description: result.message,
          className: "bg-green-500 text-white border-none",
        });
      } else {
        toast({
          title: "Aww, close!",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to submit attempt.", variant: "destructive" });
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = ms / 1000;
    return totalSeconds.toFixed(3);
  };

  return (
    <section id="challenge" className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-secondary/20 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Game Area */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 font-semibold mb-6">
              <Timer className="w-5 h-5 text-secondary" />
              <span>Daily Challenge</span>
            </div>
            <h2 className="font-display text-5xl md:text-7xl mb-6 leading-none">
              STOP AT EXACTLY <span className="text-secondary">10.000s</span>
            </h2>
            <p className="text-xl text-primary-foreground/80 font-medium mb-10">
              Win a free item from our Must Try menu if you can stop the timer exactly on 10.000 seconds (±0.1s). One try per day!
            </p>

            <div className="bg-background text-foreground rounded-3xl p-8 shadow-2xl shadow-black/20">
              {checkLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
              ) : !canPlayStatus?.canPlay && !hasPlayed ? (
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Timer className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Come back tomorrow!</h3>
                  <p className="text-muted-foreground">{canPlayStatus?.message}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  {!isPlaying ? (
                    <div className="w-full space-y-4">
                      <Input 
                        placeholder="Enter your hero name..." 
                        value={name} 
                        onChange={e => setName(e.target.value)}
                        className="text-lg h-14 bg-muted border-none rounded-xl"
                        disabled={hasPlayed}
                      />
                      <Button 
                        onClick={handleStart} 
                        disabled={hasPlayed || !name.trim()}
                        className="w-full h-16 text-xl font-bold bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-xl shadow-lg hover:scale-[1.02] transition-transform"
                      >
                        {hasPlayed ? "Played Today" : "START CHALLENGE"}
                      </Button>
                    </div>
                  ) : (
                    <div className="w-full text-center">
                      <div className={`font-mono text-7xl md:text-8xl font-bold tracking-tighter mb-8 tabular-nums ${running ? 'text-foreground' : (Math.abs((time/1000) - 10) <= 0.1 ? 'text-green-500' : 'text-destructive')}`}>
                        {formatTime(time)}
                      </div>
                      <Button 
                        onClick={handleStop}
                        disabled={!running}
                        className={`w-full h-20 text-3xl font-display tracking-wider rounded-2xl shadow-xl transition-all ${
                          running 
                            ? "bg-destructive hover:bg-destructive/90 text-white animate-pulse shadow-destructive/30" 
                            : "bg-muted text-muted-foreground cursor-not-allowed"
                        }`}
                      >
                        <Square className="w-8 h-8 mr-2 fill-current" />
                        STOP TIMER!
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Winners Board */}
          <div className="bg-black/10 backdrop-blur-md rounded-3xl p-8 border border-white/10">
            <div className="flex items-center gap-3 mb-8">
              <Trophy className="w-8 h-8 text-secondary" />
              <h3 className="font-display text-3xl text-white tracking-wide">Hall of Fame</h3>
            </div>
            
            <div className="space-y-4">
              {winners?.length === 0 ? (
                <p className="text-white/60 font-medium italic">No winners yet. Be the first!</p>
              ) : (
                winners?.map((w, i) => (
                  <div key={w.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold">
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-bold text-lg text-white">{w.userName}</p>
                        <p className="text-sm text-white/60 font-medium">Won {w.prize}</p>
                      </div>
                    </div>
                    <div className="font-mono text-lg font-bold text-secondary bg-black/20 px-3 py-1 rounded-lg">
                      {w.timeStopped.toFixed(3)}s
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
