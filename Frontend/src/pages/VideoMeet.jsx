import React, { useEffect, useRef, useState, useContext } from "react";
import getMeetingSummary from "../services/aiService";
import io from "socket.io-client";
import { AnimatePresence, motion } from "framer-motion";
import {
  Video as VideoIcon,
  VideoOff,
  Mic,
  MicOff,
  MonitorUp,
  MonitorStop,
  MessageSquare,
  Users,
  Captions,
  PhoneOff,
  Send,
  Loader2,
  ShieldCheck,
  Keyboard,
} from "lucide-react";
import server from "../environment";
import { AuthContext } from "../contexts/AuthContext";
import { ParticipantTile } from "../components/meet/ParticipantTile";
import { SidePanel } from "../components/meet/SidePanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

const server_url = server;

var connections = {};

const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export default function VideoMeetComponent() {
  var socketRef = useRef();
  let socketIdRef = useRef();

  let localVideoref = useRef();

  let [videoAvailable, setVideoAvailable] = useState(true);

  let [audioAvailable, setAudioAvailable] = useState(true);

  let [video, setVideo] = useState(true);

  let [audio, setAudio] = useState(true);

  let [screen, setScreen] = useState();

  let [showModal, setModal] = useState(false);

  let [screenAvailable, setScreenAvailable] = useState();

  let [messages, setMessages] = useState([]);

  let [message, setMessage] = useState("");

  let [newMessages, setNewMessages] = useState(0);

  let [askForUsername, setAskForUsername] = useState(true);

  let [username, setUsername] = useState("");

  const videoRef = useRef([]);

  let [videos, setVideos] = useState([]);

  // ---- UI-only state (no meeting logic) ----
  const [showParticipants, setShowParticipants] = useState(false);
  const [showCaptions, setShowCaptions] = useState(false);
  const [captions, setCaptions] = useState([]);
  const [interimCaption, setInterimCaption] = useState("");
  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [captionsSupported, setCaptionsSupported] = useState(true);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const hideTimer = useRef(null);
  const chatEndRef = useRef(null);

  // TODO
  // if(isChrome() === false) {

  // }

  useEffect(() => {
    getPermissions();
  }, []);

  useEffect(() => {
    if (!askForUsername && localVideoref.current && window.localStream) {
      localVideoref.current.srcObject = window.localStream;
    }
  }, [askForUsername]);

  const getPermissions = async () => {
    try {
      const userMediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (userMediaStream) {
        setVideoAvailable(true);
        setAudioAvailable(true);
        window.localStream = userMediaStream;
        if (localVideoref.current) {
          localVideoref.current.srcObject = userMediaStream;
        }
      }
    } catch (error) {
      console.log("Could not get combined video/audio stream, checking individually:", error);
      let vAvail = false;
      let aAvail = false;

      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoStream) {
          vAvail = true;
          setVideoAvailable(true);
        }
      } catch (e) {
        setVideoAvailable(false);
      }

      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (audioStream) {
          aAvail = true;
          setAudioAvailable(true);
        }
      } catch (e) {
        setAudioAvailable(false);
      }

      if (vAvail || aAvail) {
        try {
          const userMediaStream = await navigator.mediaDevices.getUserMedia({
            video: vAvail,
            audio: aAvail,
          });
          window.localStream = userMediaStream;
          if (localVideoref.current) {
            localVideoref.current.srcObject = userMediaStream;
          }
        } catch (e) {
          console.log(e);
        }
      }
    }

    if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
      setScreenAvailable(true);
    } else {
      setScreenAvailable(false);
    }
  };

  let getDislayMedia = () => {
    if (screen) {
      if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices
          .getDisplayMedia({ video: true, audio: true })
          .then(getDislayMediaSuccess)
          .then((stream) => {})
          .catch((e) => console.log(e));
      }
    }
  };

  // Stream track enabled toggling is handled directly in handleVideo and handleAudio
  let getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  };

  let getUserMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    localVideoref.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      connections[id].addStream(window.localStream);

      connections[id].createOffer().then((description) => {
        console.log(description);
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socketRef.current.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription }),
            );
          })
          .catch((e) => console.log(e));
      });
    }

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setVideo(false);
          setAudio(false);

          try {
            let tracks = localVideoref.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
          } catch (e) {
            console.log(e);
          }

          let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
          window.localStream = blackSilence();
          localVideoref.current.srcObject = window.localStream;

          for (let id in connections) {
            connections[id].addStream(window.localStream);

            connections[id].createOffer().then((description) => {
              connections[id]
                .setLocalDescription(description)
                .then(() => {
                  socketRef.current.emit(
                    "signal",
                    id,
                    JSON.stringify({ sdp: connections[id].localDescription }),
                  );
                })
                .catch((e) => console.log(e));
            });
          }
        }),
    );
  };

  let getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices
        .getUserMedia({ video: video, audio: audio })
        .then(getUserMediaSuccess)
        .then((stream) => {})
        .catch((e) => console.log(e));
    } else {
      try {
        let tracks = localVideoref.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      } catch (e) {}
    }
  };

  let getDislayMediaSuccess = (stream) => {
    console.log("HERE");
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    localVideoref.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      connections[id].addStream(window.localStream);

      connections[id].createOffer().then((description) => {
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socketRef.current.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription }),
            );
          })
          .catch((e) => console.log(e));
      });
    }

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setScreen(false);

          try {
            let tracks = localVideoref.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
          } catch (e) {
            console.log(e);
          }

          let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
          window.localStream = blackSilence();
          localVideoref.current.srcObject = window.localStream;

          getUserMedia();
        }),
    );
  };

  let gotMessageFromServer = (fromId, message) => {
    var signal = JSON.parse(message);

    if (fromId !== socketIdRef.current) {
      if (signal.sdp) {
        connections[fromId]
          .setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            if (signal.sdp.type === "offer") {
              connections[fromId]
                .createAnswer()
                .then((description) => {
                  connections[fromId]
                    .setLocalDescription(description)
                    .then(() => {
                      socketRef.current.emit(
                        "signal",
                        fromId,
                        JSON.stringify({ sdp: connections[fromId].localDescription }),
                      );
                    })
                    .catch((e) => console.log(e));
                })
                .catch((e) => console.log(e));
            }
          })
          .catch((e) => console.log(e));
      }

      if (signal.ice) {
        connections[fromId]
          .addIceCandidate(new RTCIceCandidate(signal.ice))
          .catch((e) => console.log(e));
      }
    }
  };

  let connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false });

    socketRef.current.on("signal", gotMessageFromServer);

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href,username);
      socketIdRef.current = socketRef.current.id;

      socketRef.current.on("chat-message", addMessage);

      socketRef.current.on("user-left", (id) => {
        setVideos((videos) => videos.filter((video) => video.socketId !== id));
      });

      socketRef.current.on("user-joined", (id, clients) => {
       clients.forEach((participant) => {
    const socketListId = participant.socketId;
    const participantName = participant.username;
    if (socketListId === socketIdRef.current) return;

connections[socketListId] = new RTCPeerConnection(peerConfigConnections);
          // Wait for their ice candidate
          connections[socketListId].onicecandidate = function (event) {
            if (event.candidate != null) {
              socketRef.current.emit(
                "signal",
                socketListId,
                JSON.stringify({ ice: event.candidate }),
              );
            }
          };

          // Wait for their video stream
          connections[socketListId].onaddstream = (event) => {
            console.log("BEFORE:", videoRef.current);
            console.log("FINDING ID: ", socketListId);

            let videoExists = videoRef.current.find((video) => video.socketId === socketListId);

            if (videoExists) {
              console.log("FOUND EXISTING");

              // Update the stream of the existing video
              setVideos((videos) => {
                const updatedVideos = videos.map((video) =>
                  video.socketId === socketListId ? { ...video, stream: event.stream } : video,
                );
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            } else {
              // Create a new video
              console.log("CREATING NEW");
              let newVideo = {
                socketId: socketListId,
                username: participantName,
                stream: event.stream,
                autoplay: true,
                playsinline: true,
              };

              setVideos((videos) => {
                const updatedVideos = [...videos, newVideo];
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            }
          };

          // Add the local video stream
          if (window.localStream !== undefined && window.localStream !== null) {
            connections[socketListId].addStream(window.localStream);
          } else {
            let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            connections[socketListId].addStream(window.localStream);
          }
        });

        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) continue;

            try {
              connections[id2].addStream(window.localStream);
            } catch (e) {}

            connections[id2].createOffer().then((description) => {
              connections[id2]
                .setLocalDescription(description)
                .then(() => {
                  socketRef.current.emit(
                    "signal",
                    id2,
                    JSON.stringify({ sdp: connections[id2].localDescription }),
                  );
                })
                .catch((e) => console.log(e));
            });
          }
        }
      });
    });
  };

  let silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();
    let dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };
  let black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), { width, height });
    canvas.getContext("2d").fillRect(0, 0, width, height);
    let stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };

  let handleVideo = () => {
    setVideo((prevVideo) => {
      const nextState = !prevVideo;
      if (window.localStream) {
        window.localStream.getVideoTracks().forEach((track) => {
          track.enabled = nextState;
        });
      }
      return nextState;
    });
  };

  let handleAudio = () => {
    setAudio((prevAudio) => {
      const nextState = !prevAudio;
      if (window.localStream) {
        window.localStream.getAudioTracks().forEach((track) => {
          track.enabled = nextState;
        });
      }
      return nextState;
    });
  };

  useEffect(() => {
    if (screen !== undefined) {
      getDislayMedia();
    }
  }, [screen]);
  let handleScreen = () => {
    setScreen(!screen);
  };

  let handleEndCall = () => {
    try {
      let tracks = localVideoref.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    } catch (e) {}
    window.location.href = "/";
  };

  let openChat = () => {
    setModal(true);
    setNewMessages(0);
  };
  let closeChat = () => {
    setModal(false);
  };
  let handleMessage = (e) => {
    setMessage(e.target.value);
  };

  const addMessage = (data, sender, socketIdSender) => {
    setMessages((prevMessages) => [...prevMessages, { sender: sender, data: data }]);
    if (socketIdSender !== socketIdRef.current) {
      setNewMessages((prevNewMessages) => prevNewMessages + 1);
    }
  };

  const { addToHistory } = useContext(AuthContext);

  let sendMessage = () => {
    console.log(socketRef.current);
    socketRef.current.emit("chat-message", message, username);
    setMessage("");
  };

  let connect = async () => {
    setAskForUsername(false);
    getMedia();
    if (localStorage.getItem("token")) {
      try {
        await addToHistory(window.location.href);
      } catch (err) {
        console.log("Activity history error:", err);
      }
    }
  };

  // ---------------- UI-only behaviour ----------------

  const toggleChat = () => {
    if (showModal) {
      closeChat();
    } else {
      openChat();
      setShowParticipants(false);
    }
  };

  const toggleParticipants = () => {
    setShowParticipants((prev) => {
      if (!prev) closeChat();
      return !prev;
    });
  };

  // Auto-hide floating toolbar after inactivity
  useEffect(() => {
    if (askForUsername) return;
    const wake = () => {
      setControlsVisible(true);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => setControlsVisible(false), 3800);
    };
    wake();
    window.addEventListener("mousemove", wake);
    window.addEventListener("touchstart", wake);
    window.addEventListener("keydown", wake);
    return () => {
      window.removeEventListener("mousemove", wake);
      window.removeEventListener("touchstart", wake);
      window.removeEventListener("keydown", wake);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [askForUsername]);

  // Keyboard shortcuts
  useEffect(() => {
    if (askForUsername) return;
    const onKey = (e) => {
      const tag = e.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || e.target?.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      switch (e.key.toLowerCase()) {
        case "m":
          handleAudio();
          break;
        case "v":
          handleVideo();
          break;
        case "s":
          if (screenAvailable) handleScreen();
          break;
        case "c":
          toggleChat();
          break;
        case "p":
          toggleParticipants();
          break;
        case "k":
          setShowCaptions((s) => !s);
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // Live captions from the browser speech engine
  useEffect(() => {
    if (!showCaptions || askForUsername) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.log("❌ Speech Recognition not supported");
      setCaptionsSupported(false);
      return;
    }

    setCaptionsSupported(true);

    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-IN";

    recognition.onstart = () => {
      console.log("🎤 Speech recognition started");
    };

    recognition.onresult = (event) => {
      console.log("📝 Speech result received");

      let interim = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript.trim();

        if (result.isFinal) {
          console.log("✅ Caption:", text);

          setCaptions((prev) => [
            ...prev.slice(-40),
            {
              id: `${Date.now()}-${i}`,
              speaker: username || "You",
              text,
            },
          ]);
        } else {
          interim += text;
        }
      }

      setInterimCaption(interim);
    };

    recognition.onerror = (event) => {
      console.log("❌ Speech recognition error:", event.error);
    };

    recognition.onend = () => {
      console.log("🛑 Speech recognition ended");
    };

    try {
      recognition.start();
    } catch (error) {
      console.log("❌ Could not start:", error);
    }

    return () => {
      console.log("🧹 Stopping speech recognition");

      try {
        recognition.stop();
      } catch (error) {
        console.log("Stop error:", error);
      }

      setInterimCaption("");
    };
  }, [showCaptions, askForUsername, username]);
  const generateSummary = async () => {
    if (captions.length === 0) {
      alert("No captions available yet.");
      return;
    }

    try {
      setSummaryLoading(true);

      const transcript = captions
        .map((caption) => `${caption.speaker}: ${caption.text}`)
        .join("\n");

      console.log("📄 Transcript sent to AI:");
      console.log(transcript);

      const response = await getMeetingSummary(transcript);

      console.log("🤖 AI Summary:", response);

      setSummary(response.summary);
    } catch (error) {
      console.error("❌ Summary generation failed:", error);
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showModal]);

  const panelOpen = showModal || showParticipants || showCaptions;
  const totalParticipants = videos.length + 1;

  const ControlButton = ({ onClick, active, danger, label, shortcut, badge, children }) => (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      whileHover={{ y: -2 }}
      aria-label={shortcut ? `${label} (shortcut ${shortcut})` : label}
      aria-pressed={typeof active === "boolean" ? active : undefined}
      title={shortcut ? `${label} · ${shortcut}` : label}
      className={`relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl border transition-colors ${
        danger
          ? "border-transparent bg-destructive text-destructive-foreground hover:opacity-90"
          : active === false
            ? "border-transparent bg-destructive/85 text-destructive-foreground hover:opacity-90"
            : "border-hairline bg-[var(--fill)] text-ink hover:bg-[var(--fill-2)]"
      }`}
    >
      {children}
      {badge > 0 && (
        <span
          className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] font-semibold text-on-brand"
          style={{ background: "var(--gradient-brand)" }}
        >
          {badge > 999 ? "999+" : badge}
        </span>
      )}
    </motion.button>
  );

  // ---------------- Lobby ----------------
  if (askForUsername === true) {
    return (
      <main className="night relative min-h-screen overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: "var(--gradient-veil)" }}
        />
        <div className="relative mx-auto grid min-h-screen w-full max-w-6xl items-center gap-8 px-5 py-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="glass relative aspect-video overflow-hidden rounded-3xl"
          >
            <video
              ref={localVideoref}
              autoPlay
              muted
              playsInline
              className={`h-full w-full -scale-x-100 object-cover ${video ? "opacity-100" : "opacity-0"}`}
            />
            {!video && (
              <div className="absolute inset-0 grid place-items-center text-sm text-ink-muted">
                Camera preview off
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-[var(--scrim)] to-transparent px-4 py-3">
              <span className="truncate text-sm text-ink-soft">
                {username ? username : "Preview"}
              </span>
              <span className="flex items-center gap-2">
                <ControlButton
                  onClick={handleAudio}
                  active={audio}
                  label={audio ? "Mute microphone" : "Unmute microphone"}
                >
                  {audio ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                </ControlButton>
                <ControlButton
                  onClick={handleVideo}
                  active={video}
                  label={video ? "Turn camera off" : "Turn camera on"}
                >
                  {video ? <VideoIcon className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                </ControlButton>
              </span>
            </div>
          </motion.div>

          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="glass w-full rounded-3xl p-6 sm:p-8"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-hairline px-3 py-1.5 text-xs text-ink-soft">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                Peer-to-peer · encrypted in transit
              </span>
              <ThemeToggle />
            </div>
            <Logo className="mt-6 h-8" />
            <h1 className="mt-5 font-display text-3xl font-semibold text-ink sm:text-4xl">
              Ready to <span className="text-gradient">join</span>?
            </h1>
            <p className="mt-3 text-sm text-ink-muted">
              Check your camera and mic, then hop into the room.
            </p>

            <form
              className="mt-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                connect();
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="lobby-username" className="text-ink-soft">
                  Display name
                </Label>
                <Input
                  id="lobby-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                  className="h-11 border-hairline bg-[var(--fill)] text-ink placeholder:text-ink-muted"
                />
              </div>
              <Button
                type="submit"
                className="h-11 w-full rounded-xl border-0 text-on-brand hover:opacity-90"
                style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-lift)" }}
              >
                Connect
              </Button>
            </form>
          </motion.section>
        </div>
      </main>
    );
  }

  // ---------------- In-meeting ----------------
  return (
    <main className="night relative flex h-screen flex-col overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: "var(--gradient-veil)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-48 -left-40 h-[30rem] w-[30rem] rounded-full opacity-30 blur-3xl"
        style={{ background: "var(--gradient-brand)" }}
      />

      {/* Top bar */}
      <AnimatePresence>
        {controlsVisible && (
          <motion.header
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
            className="relative z-30 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
                style={{ background: "var(--gradient-brand)" }}
              >
                <VideoIcon className="h-4 w-4 text-on-brand" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <h1 className="truncate text-sm font-semibold text-ink">Syncora meeting</h1>
                <p className="truncate text-xs text-ink-muted">
                  {totalParticipants} {totalParticipants === 1 ? "participant" : "participants"}
                  {screen ? " · screen sharing" : ""}
                </p>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`hidden items-center gap-2 rounded-full border border-hairline px-3 py-1.5 text-xs text-ink-muted ${panelOpen ? "xl:flex" : "sm:flex"}`}
              >
                <Keyboard className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />M mic · V cam · S
                share · C chat · P people · K captions
              </span>
              <ThemeToggle />
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Stage */}
      <section
        className={`relative z-10 min-h-0 flex-1 overflow-y-auto px-4 pb-32 transition-[padding] duration-300 sm:px-6 ${
          panelOpen ? "lg:pr-[26rem]" : ""
        }`}
        aria-label="Participant video grid"
      >
        <motion.div
          layout
          className={`grid gap-4 ${
            videos.length === 0
              ? "mx-auto max-w-3xl grid-cols-1"
              : videos.length === 1
                ? "grid-cols-1 lg:grid-cols-2"
                : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
          }`}
        >
          <AnimatePresence mode="popLayout">
            <ParticipantTile
              key="local"
              label={username || "You"}
              stream={typeof window !== "undefined" ? window.localStream : null}
              videoRefCallback={localVideoref}
              muted
              mirrored={!screen}
              cameraOff={!video && !screen}
              micOff={!audio}
              isLocal
              isScreen={!!screen}
            />
            {videos.map((v) => (
              <ParticipantTile
                key={v.socketId}
                label={v.username || "Guest"}
                stream={v.stream}
                videoRefCallback={(ref) => {
                  if (ref && v.stream) {
                    ref.srcObject = v.stream;
                  }
                }}
                cameraOff={false}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {videos.length === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 flex items-center justify-center gap-2 text-sm text-ink-muted"
          >
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Waiting for someone to join — share the meeting link.
          </motion.p>
        )}

        {/* Screen-share highlight */}
        <AnimatePresence>
          {screen && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="glass mx-auto mt-4 flex max-w-md items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm text-ink-soft"
            >
              <motion.span
                className="h-2 w-2 rounded-full bg-aqua"
                animate={{ scale: [1, 1.6, 1], opacity: [1, 0.4, 1] }}
                transition={{ repeat: Infinity, duration: 1.6 }}
                aria-hidden="true"
              />
              You are sharing your screen
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Floating auto-hiding toolbar */}
      <AnimatePresence>
        {controlsVisible && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-x-0 bottom-5 z-40 flex justify-center px-4"
          >
            <nav
              aria-label="Meeting controls"
              className="glass flex max-w-full items-center gap-2 overflow-x-auto rounded-3xl px-3 py-2.5"
            >
              <ControlButton
                onClick={handleAudio}
                active={audio}
                label={audio ? "Mute microphone" : "Unmute microphone"}
                shortcut="M"
              >
                {audio ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              </ControlButton>
              <ControlButton
                onClick={handleVideo}
                active={video}
                label={video ? "Turn camera off" : "Turn camera on"}
                shortcut="V"
              >
                {video ? <VideoIcon className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </ControlButton>
              {screenAvailable === true && (
                <ControlButton
                  onClick={handleScreen}
                  label={screen ? "Stop sharing screen" : "Share screen"}
                  shortcut="S"
                >
                  {screen ? <MonitorStop className="h-5 w-5" /> : <MonitorUp className="h-5 w-5" />}
                </ControlButton>
              )}
              <ControlButton
                onClick={toggleChat}
                label="Chat"
                shortcut="C"
                badge={showModal ? 0 : newMessages}
              >
                <MessageSquare className="h-5 w-5" />
              </ControlButton>
              <ControlButton onClick={toggleParticipants} label="Participants" shortcut="P">
                <Users className="h-5 w-5" />
              </ControlButton>
              <ControlButton
                onClick={() => setShowCaptions((s) => !s)}
                label="AI captions"
                shortcut="K"
              >
                <Captions className="h-5 w-5" />
              </ControlButton>
              <span className="mx-1 h-8 w-px shrink-0 bg-[var(--fill-2)]" aria-hidden="true" />
              <ControlButton onClick={handleEndCall} danger label="Leave meeting">
                <PhoneOff className="h-5 w-5" />
              </ControlButton>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat drawer */}
      <SidePanel
        open={showModal}
        onClose={closeChat}
        title="Chat"
        icon={MessageSquare}
        footer={
          <form
            className="flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
          >
            <label htmlFor="chat-input" className="sr-only">
              Message
            </label>
            <Input
              id="chat-input"
              value={message}
              onChange={handleMessage}
              placeholder="Send a message"
              className="h-11 border-hairline bg-[var(--fill)] text-ink placeholder:text-ink-muted"
            />
            <Button
              type="submit"
              aria-label="Send message"
              className="h-11 w-11 shrink-0 rounded-xl border-0 p-0 text-on-brand hover:opacity-90"
              style={{ background: "var(--gradient-brand)" }}
            >
              <Send className="h-4 w-4" aria-hidden="true" />
            </Button>
          </form>
        }
      >
        {messages.length !== 0 ? (
          <ul className="space-y-3">
            <AnimatePresence initial={false}>
              {messages.map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-hairline bg-[var(--fill)] px-3 py-2"
                >
                  <p className="text-xs font-semibold text-ink-soft">{item.sender}</p>
                  <p className="mt-0.5 text-sm break-words text-ink">{item.data}</p>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        ) : (
          <p className="mt-8 text-center text-sm text-ink-muted">No messages yet</p>
        )}
        <div ref={chatEndRef} />
      </SidePanel>

      {/* Participants drawer */}
      <SidePanel
        open={showParticipants}
        onClose={() => setShowParticipants(false)}
        title={`Participants (${totalParticipants})`}
        icon={Users}
      >
        <ul className="space-y-2">
          <li className="flex items-center justify-between gap-3 rounded-2xl border border-hairline bg-[var(--fill)] px-3 py-2.5">
            <span className="min-w-0 truncate text-sm text-ink">{username || "You"} (you)</span>
            <span className="flex shrink-0 items-center gap-2 text-ink-muted">
              {audio ? (
                <Mic className="h-4 w-4" aria-label="Mic on" />
              ) : (
                <MicOff className="h-4 w-4 text-destructive" aria-label="Mic off" />
              )}
              {video ? (
                <VideoIcon className="h-4 w-4" aria-label="Camera on" />
              ) : (
                <VideoOff className="h-4 w-4 text-destructive" aria-label="Camera off" />
              )}
            </span>
          </li>
          {videos.map((v) => (
            <motion.li
              key={v.socketId}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between gap-3 rounded-2xl border border-hairline bg-[var(--fill)] px-3 py-2.5"
            >
              <span className="min-w-0 truncate text-sm text-ink">
               {v.username || "Guest"}
              </span>
              <span className="shrink-0 text-xs text-ink-muted">connected</span>
            </motion.li>
          ))}
        </ul>
      </SidePanel>

      {/* AI captions panel */}
      <SidePanel
        open={showCaptions}
        onClose={() => setShowCaptions(false)}
        title="AI captions"
        icon={Captions}
      >
        {/* AI Summary Button */}
        <Button
          onClick={generateSummary}
          disabled={summaryLoading || captions.length === 0}
          className="w-full mb-4"
        >
          {summaryLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Summary...
            </>
          ) : (
            "✨ Generate AI Summary"
          )}
        </Button>

        {!captionsSupported ? (
          <p className="text-sm text-ink-muted">
            Live captions aren&apos;t supported in this browser. Try Chrome or Edge.
          </p>
        ) : captions.length === 0 && !interimCaption ? (
          <div className="mt-8 flex flex-col items-center gap-3 text-sm text-ink-muted">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            Listening for speech…
          </div>
        ) : (
          <div aria-live="polite" className="space-y-3">
            {captions.map((c) => (
              <motion.p
                key={c.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-ink"
              >
                <span className="mr-2 text-xs font-semibold text-aqua">{c.speaker}</span>
                {c.text}
              </motion.p>
            ))}

            {interimCaption && <p className="text-sm text-ink-muted italic">{interimCaption}</p>}
          </div>
        )}

        {/* AI Summary Result */}
        {summary && (
          <div className="mt-6 border-t border-hairline pt-4">
            <h3 className="mb-2 text-sm font-semibold text-ink">🤖 AI Meeting Summary</h3>

            <p className="whitespace-pre-wrap text-sm text-ink-muted">{summary}</p>
          </div>
        )}
      </SidePanel>
    </main>
  );
}
