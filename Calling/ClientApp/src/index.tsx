// © Microsoft Corporation. All rights reserved.
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { Provider } from '@fluentui/react-northstar';
import { svgIconStyles } from '@fluentui/react-northstar/dist/es/themes/teams/components/SvgIcon/svgIconStyles';
import { svgIconVariables } from '@fluentui/react-northstar/dist/es/themes/teams/components/SvgIcon/svgIconVariables';
import * as siteVariables from '@fluentui/react-northstar/dist/es/themes/teams/siteVariables';
import { MsalProvider } from "@azure/msal-react";
import { Configuration,  PublicClientApplication } from "@azure/msal-browser";
import { utils } from './Utils/Utils';

declare interface AppConfig {
  b2cClientId: string,
  b2cTenantName: string,
  signUpSignInPolicyId: string
}

// Get app configuration from the server-side API
const request = new XMLHttpRequest();
request.open('GET', '/config', false);  // `false` makes the request synchronous
request.send(null);
const appConfig = JSON.parse(request.responseText) as AppConfig;

// MSAL configuration
const configuration: Configuration = {
  auth: {
    clientId: appConfig.b2cClientId,
    authority: `https://${appConfig.b2cTenantName}.b2clogin.com/${appConfig.b2cTenantName}.onmicrosoft.com/${appConfig.signUpSignInPolicyId}`,
    knownAuthorities: [`${appConfig.b2cTenantName}.b2clogin.com`]
  },
  cache: {
    cacheLocation: "localStorage", // This configures where your cache will be stored
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  }
};

const msalInstance = new PublicClientApplication(configuration);
utils.initializeMsal(msalInstance, [appConfig.b2cClientId] /* Use the app's Client ID as the scope to request a token for itself */);

const iconTheme = {
  componentStyles: {
    SvgIcon: svgIconStyles
  },
  componentVariables: {
    SvgIcon: svgIconVariables
  },
  siteVariables
};

ReactDOM.render(
  <Provider theme={iconTheme} className="wrapper">
    <MsalProvider instance={msalInstance}>
      <App />
    </MsalProvider>
  </Provider>,
  document.getElementById('root')
);
