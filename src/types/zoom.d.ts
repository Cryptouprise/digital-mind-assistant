
interface ZoomMtgParams {
  meetingNumber: string;
  userName: string;
  signature: string;
  apiKey: string;
  passWord?: string;
  success?: () => void;
  error?: (error: any) => void;
}

interface ZoomMtgInitParams {
  leaveUrl?: string;
  success?: () => void;
  error?: (error: any) => void;
  disableCORP?: boolean;
  isSupportAV?: boolean;
  isSupportChat?: boolean;
  isSupportQA?: boolean;
  isSupportPolling?: boolean;
  isSupportBreakout?: boolean;
}

interface ZoomMtg {
  init: (params: ZoomMtgInitParams) => void;
  join: (params: ZoomMtgParams) => void;
  setZoomJSLib: (path: string, dir: string) => void;
  preLoadWasm: () => void;
  prepareWebSDK: () => void;
  prepareJssdk: () => void;
  inMeetingServiceListener: (event: string, callback: Function) => void;
  mute: (params: { mute: boolean; success?: () => void; }) => void;
  videoOff: (params: { videoOff: boolean; success?: () => void; }) => void;
  leaveMeeting: (params?: { success?: () => void; }) => void;
  getAttendeeslist: (callback: Function) => void;
  getCurrentUser: () => { userGUID: string };
  getClientVersion: () => string;
  checkSystemRequirements: () => {
    os: boolean;
    browser: boolean;
    webRTC: boolean;
  };
  getUserInfo: (params: { success: (info: any) => void; }) => void;
  getRecordingStatus: (params: { success: (status: any) => void; }) => void;
  startRecording: (params: { success?: () => void; }) => void;
  stopRecording: (params: { success?: () => void; }) => void;
}

declare global {
  interface Window {
    ZoomMtg?: ZoomMtg;
  }
}

export {};
