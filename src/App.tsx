import { useEffect, useRef, useState } from 'react';
import './App.css'

type MediaDeviceInfo = {
  deviceId: string;
  label: string;
}

type MediaOption = {
  width?: number;
  height?: number;
}

const MediaOptions: { [label: string]: MediaOption  } = {
  "Default": {},
  "1080p": { width: 1920, height: 1080 },
  "720p": { width: 1280, height: 720 },
}

function App() {
  // parse uri path
  const searchParams = new URLSearchParams(window.location.search);
  const deviceId = searchParams.get("deviceId") || "";
  const option = searchParams.get("option") || "Default";  

  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [mediaDevices, setMediaDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(deviceId);
  const [selectedOption, setSelectedOption] = useState<string>(option);
  const webcamRef = useRef<HTMLVideoElement>(null);

  const streamMedia = async (deviceId: string, option: string) => {
    const webcam = webcamRef.current;
    if (webcam) {
      console.log("streamMedia", deviceId, option, MediaOptions[option]);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: deviceId }, ...MediaOptions[option] } });
      webcam.srcObject = stream;
      window.history.replaceState(null, "", `?deviceId=${deviceId}&option=${option}`);
    }
  }

  useEffect(() => {
    (async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === "videoinput").map(device => ({ deviceId: device.deviceId, label: device.label }));
      setMediaDevices(videoDevices);
      const deviceId = (videoDevices.length > 0) ? videoDevices[0].deviceId : "";
      setSelectedDeviceId(deviceId);
      streamMedia(deviceId, selectedOption);
    })();
  }, []);

  const selectDevice = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    streamMedia(deviceId, selectedOption);
  }

  const selectOption = (option: string) => {
    setSelectedOption(option);
    streamMedia(selectedDeviceId, option);
  }

  const toggelSettings = () => {
    setShowSettings(!showSettings);
  }

  return (
    <>
      <div className="webcam-video">
        <video ref={webcamRef} autoPlay playsInline muted></video>
      </div>
      {showSettings &&
        <>
          <div className="settings" onClick={toggelSettings}>
          </div>
          <div className="settings-dialog">
            <h2>Source Media</h2>
            <select onChange={(e) => selectDevice(e.target.value)} value={selectedDeviceId}>
              {mediaDevices.map((device, index) => <option key={index} value={device.deviceId}>{device.label}</option>)}
            </select>
            <h2>Source Option</h2>
            <select onChange={(e) => selectOption(e.target.value)} value={selectedOption}>
              {Object.keys(MediaOptions).map((label, index) => <option key={index} value={label}>{label}</option>)}
            </select>
          </div>
        </>
      }
      <img className="settings-icon" src="/settings.svg" alt="Settings" width="32" onClick={toggelSettings} />
    </>
  )
}

export default App
