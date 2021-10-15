// © Microsoft Corporation. All rights reserved.
import { AudioDeviceInfo, VideoDeviceInfo, RemoteVideoStream } from '@azure/communication-calling';
import { CommunicationIdentifierKind } from '@azure/communication-common';
import { CommunicationUserToken } from '@azure/communication-identity';
import { FeedbackSettings } from 'feedbacks/FeedbackSettings';
import preval from 'preval.macro';
import { RecordingSettings } from '../recording/RecordingSettings';
import { PublicClientApplication } from "@azure/msal-browser";

export declare interface RecordingApiResponse {
  message: string;
}
export declare interface RecordingActionResponse {
  message: string;
}
export declare interface RecordingLinkResponse {
  uri: string;
  message: string;
}

var msalInstance: PublicClientApplication | null = null;
var msalScopes: string[] = [];

export const utils = {
  getAppServiceUrl: (): string => {
    return window.location.origin;
  },
  initializeMsal: (instance: PublicClientApplication, scopes: string[]) => {
    msalInstance = instance;
    msalScopes = scopes;
  },
  getTokenForUser: async (): Promise<CommunicationUserToken> => {
    if (msalInstance === null) {
      throw new Error("MSAL isn't initialized");
    }
    const accounts = msalInstance.getAllAccounts();
    const request = { scopes: msalScopes, account: accounts[0] };
    const authResult = await msalInstance.acquireTokenSilent(request);
    const response = await fetch('/token', { headers: new Headers ({ "Authorization": `Bearer ${authResult.accessToken}`})});
    if (response.ok) {
      return response.json();
    }
    throw new Error('Invalid token response');
  },
  getFeedbackSettings: async (): Promise<FeedbackSettings> => {
    const response = await fetch('/feedbackSettings');
    if (!response.ok) {
      throw new Error('Failed to get blob settings from server!');
    }
    const retJson = await response.json();
    return {
      ...retJson,
      isFeedbackEnabled: retJson.isFeedbackEnabled.toLowerCase() === 'true'
    };
  },
  getRecordingSettings: async (): Promise<RecordingSettings> => {
    const response = await fetch('/recordingSettings');
    if (!response.ok) {
      throw new Error('Failed to get recording settings from server!');
    }
    const retJson = await response.json();
    return {
      ...retJson,
      isRecordingEnabled: retJson.isRecordingEnabled.toLowerCase() === 'true'
    };
  },
  startRecording: async (id: string): Promise<RecordingApiResponse> => {
    try {
      const response = await fetch('/recording/startRecording?serverCallId=' + id);
      if (response.ok) {
        return { message: '' };
      }
      const output = await response.json();
      const errorMessage = output.message || 'Recording could not be started';
      return { message: errorMessage };
    } catch (e) {
      return { message: 'Recording could not be started' };
    }
  },
  stopRecording: async (serverCallId: string): Promise<RecordingActionResponse> => {
    try {
      const response = await fetch('/recording/stopRecording?serverCallId=' + serverCallId);
      if (response.ok) {
        return { message: '' };
      }
      return { message: 'Recording could not be stopped' };
    } catch (e) {
      return { message: 'Recording could not be stopped' };
    }
  },
  getRecordingLink: async (id: string): Promise<RecordingLinkResponse> => {
    const recLinkResponse: RecordingLinkResponse = { uri: '', message: '' };
    try {
      const response = await fetch('/recording/getRecordingLink?serverCallId=' + id);
      const content = await response.json();
      if (response.ok) {
        recLinkResponse.uri = content.uri;
      } else {
        recLinkResponse.message = content.message;
      }
    } catch (e) {
      console.error(e.message);
      recLinkResponse.message = e.message;
    }
    return recLinkResponse;
  },
  isSelectedAudioDeviceInList(selected: AudioDeviceInfo, list: AudioDeviceInfo[]): boolean {
    return list.filter((item) => item.name === selected.name).length > 0;
  },
  isSelectedVideoDeviceInList(selected: VideoDeviceInfo, list: VideoDeviceInfo[]): boolean {
    return list.filter((item) => item.name === selected.name).length > 0;
  },
  isMobileSession(): boolean {
    return window.navigator.userAgent.match(/(iPad|iPhone|iPod|Android|webOS|BlackBerry|Windows Phone)/g)
      ? true
      : false;
  },
  isSmallScreen(): boolean {
    return window.innerWidth < 700 || window.innerHeight < 400;
  },
  isUnsupportedBrowser(): boolean {
    return window.navigator.userAgent.match(/(Firefox)/g) ? true : false;
  },
  getId: (identifier: CommunicationIdentifierKind): string => {
    switch (identifier.kind) {
      case 'communicationUser':
        return identifier.communicationUserId;
      case 'phoneNumber':
        return identifier.phoneNumber;
      case 'microsoftTeamsUser':
        return identifier.microsoftTeamsUserId;
      case 'unknown':
        return identifier.id;
      default:
        return '';
    }
  },
  getStreamId: (userId: string, stream: RemoteVideoStream): string => {
    return `${userId}-${stream.id}-${stream.mediaStreamType}`;
  },
  /*
   * TODO:
   *  Remove this method once the SDK improves error handling for unsupported browser.
   */
  isOnIphoneAndNotSafari(): boolean {
    const userAgent = navigator.userAgent;
    // Chrome uses 'CriOS' in user agent string and Firefox uses 'FxiOS' in user agent string.
    if (userAgent.includes('iPhone') && (userAgent.includes('FxiOS') || userAgent.includes('CriOS'))) {
      return true;
    }
    return false;
  },
  isSafari(): boolean {
    // https://stackoverflow.com/questions/7944460/detect-safari-browser
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    return isSafari;
  },
  getBuildTime: (): string => {
    const dateTimeStamp = preval`module.exports = new Date().toLocaleString();`;
    return dateTimeStamp;
  }
};
