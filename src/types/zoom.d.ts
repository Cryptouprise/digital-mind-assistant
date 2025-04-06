
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
  init: () => void;
  join: (params: ZoomMtgParams) => boolean;
  mute?: (params: { mute: boolean }) => void;
  videoOff?: (params: { videoOff: boolean }) => void;
  leaveMeeting?: (params: any) => void;
}

declare global {
  interface Window {
    ZoomMtg?: ZoomMtg;
  }
}
