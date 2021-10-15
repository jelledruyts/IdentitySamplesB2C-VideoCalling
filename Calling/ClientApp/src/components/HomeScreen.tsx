// © Microsoft Corporation. All rights reserved.
import React, { useState }  from 'react';
import { Stack, PrimaryButton, Icon, Image, IImageStyles, TextField } from '@fluentui/react';
import { VideoCameraEmphasisIcon } from '@fluentui/react-icons-northstar';
import heroSVG from '../assets/hero.svg';
import { v1 as createGUID } from 'uuid';
import {
  imgStyle,
  containerTokens,
  listStyle,
  iconStyle,
  headerStyle,
  upperStackTokens,
  videoCameraIconStyle,
  nestedStackTokens,
  upperStackStyle, listItemStyle
} from './styles/HomeScreen.styles';
import { useMsal } from "@azure/msal-react";

export interface HomeScreenProps {
  startCallHandler(groupId: string): void;
  joinTeamsMeeting(meetingLink: string): void;
}

const imageStyleProps: IImageStyles = {
  image: {
    height: '100%',
    width: '100%'
  },
  root: {}
};

export const HomeScreen = (props: HomeScreenProps): JSX.Element => {
  const [meetingUrl, setMeetingUrl] = useState('');
  const groupId: string = createGUID();
  const iconName = 'SkypeCircleCheck';
  const imageProps = { src: heroSVG.toString() };
  const headerTitle = 'Video Calling';
  const startCallButtonText = 'Start a call that others can join';
  const joinTeamsCallText = 'Join a Teams meeting';
  const listItems = [
    'Connect with other users of this platform',
    'Get in touch with our call center via a Teams meeting link'
  ];
  const { instance } = useMsal();
  return (
    <Stack horizontal horizontalAlign="center" verticalAlign="center" tokens={containerTokens}>
      <Stack className={upperStackStyle} tokens={upperStackTokens}>
        <div className={headerStyle}>{headerTitle}</div>
        <div>Welcome, <b>{instance.getAllAccounts()[0].username}</b>! <button onClick={() => instance.logout()}>Log out</button></div>
        <Stack tokens={nestedStackTokens}>
            <ul className={listStyle}>
                <li className={listItemStyle}>
                    <Icon className={iconStyle} iconName={iconName} /> {listItems[0]}
                </li>
                <li className={listItemStyle}>
                    <Icon className={iconStyle} iconName={iconName} /> {listItems[1]}
                </li>
            </ul>
        </Stack>
        <Stack.Item>
          <PrimaryButton onClick={() => props.startCallHandler(groupId)}>
            <VideoCameraEmphasisIcon className={videoCameraIconStyle} size="medium" />
            {startCallButtonText}
          </PrimaryButton>
          <TextField disabled={true} value={groupId} />
        </Stack.Item>
        <Stack.Item>
          <PrimaryButton disabled={meetingUrl === ''} onClick={() => props.joinTeamsMeeting(meetingUrl)}>
            <VideoCameraEmphasisIcon className={videoCameraIconStyle} size="medium" />
            {joinTeamsCallText}
          </PrimaryButton>
        <TextField placeholder="Enter a Teams meeting link which you received" onChange={(event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => { newValue === undefined ? setMeetingUrl('') : setMeetingUrl(newValue)}} />
        </Stack.Item>
      </Stack>
      <Image
        alt="Welcome to the Azure Communication Services Calling sample app"
        className={imgStyle}
        styles={imageStyleProps}
        {...imageProps}
      />
    </Stack>
  );
};