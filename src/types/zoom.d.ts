
interface ZoomMtgParams {
  meetingNumber: string;
  userName: string;
  signature?: string;
  apiKey?: string;
  passWord?: string;
  success?: () => void;
  error?: (error: any) => void;
}

interface ZoomMtg {
  init: (params?: any) => void;
  join: (params: ZoomMtgParams) => boolean;
  mute?: (params: { mute: boolean }) => void;
  videoOff?: (params: { videoOff: boolean }) => void;
  leaveMeeting?: (params: any) => void;
  // Adding additional methods for future use
  getClientVersion?: () => string;
  checkSystemRequirements?: () => {
    os: boolean;
    browser: boolean;
    webRTC: boolean;
  };
}

declare global {
  interface Window {
    ZoomMtg?: ZoomMtg;
  }
}

export {};
