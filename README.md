# Identity Sample for Azure AD B2C - Video Calling

This repository contains an ASP.NET Core project which demonstrates video calling using [Azure Communication Services](https://docs.microsoft.com/azure/communication-services/) in a web application secured by [Azure Active Directory B2C](https://azure.microsoft.com/services/active-directory-b2c/).

**IMPORTANT NOTE: The code in this repository is _not_ production-ready. It serves only to demonstrate the main points via minimal working code, and contains no exception handling or other special cases. Refer to the official documentation and samples for more information. Similarly, by design, it does not implement any caching or data persistence (e.g. to a database) to minimize the concepts and technologies being used.**

## Scenario

Applications that are used by end customers can sometimes benefit from a direct communication channel between the end user and the people within the organization that's providing the service - for example, connecting patients with a healthcare professional, banking customers with their portfolio manager, citizens with their local municipal service, etc. In this sample, we'll refer to these users as *customers* and *back-office users*, respectively.

When [Azure AD B2C](https://docs.microsoft.com/azure/active-directory-b2c/overview) is used as the identity service for the application, it's often because the organization wants to provide a completely white-labelled customer experience. [Azure Communication Services](https://docs.microsoft.com/azure/communication-services/) can then be used to seamlessly integrate voice, video, chat and even telephony into the application. Due to its [identity-agnostic approach](https://docs.microsoft.com/azure/communication-services/concepts/identity-model), *any* end user - and not necessarily a Microsoft 365 or Azure AD user - can then use these communication features. On top of that, with [Teams interoperability](https://docs.microsoft.com/azure/communication-services/concepts/teams-interop) (in public preview at the time of writing), customers using only the white-labelled application can connect directly with back-office users that happen to be using [Microsoft Teams](https://www.microsoft.com/microsoft-teams/group-chat-software).

This sample demonstrates a single-page application secured by Azure AD B2C, which allows video calling between customers (using the web application) and back-office users (using the web application as well, or alternatively via a Teams meeting). It's based on the [Azure Communication Services group calling "hero" sample](https://github.com/Azure-Samples/communication-services-web-calling-hero/tree/public-preview), with only minimal changes made to change from anonymous usage to "Bring-Your-Own-Identity" based on Azure AD B2C's signed-in user.

The *communication user id* that is used by Azure Communication Services and that should be mapped to the Azure AD B2C user is typically [stored in a user database](https://docs.microsoft.com/azure/communication-services/quickstarts/access-tokens#create-an-identity). This sample implementation stores user information locally on the file system for simplicity, but in real-world scenarios this would typically use an external database. Alternatively, you could also store the mapping in Azure AD B2C itself as a [custom user attribute](https://docs.microsoft.com/azure/active-directory-b2c/user-flow-custom-attributes?pivots=b2c-user-flow) and make it available to the application directly from the user's access token. Populating the custom attribute can then be done via the [Graph API](https://docs.microsoft.com/azure/active-directory-b2c/microsoft-graph-operations) or by using an [API Connector at sign-up](https://docs.microsoft.com/azure/active-directory-b2c/add-api-connector?pivots=b2c-user-flow) to already provision the user in Azure Communication Services and store their *communication user id* in Azure AD B2C immediately.

Currently, the sample doesn't treat a back-office user differently from an end customer to keep the changes from the original sample as small as possible. However, it could quite easily be extended to allow customers to request video calls, and back-office users to accept these and provide customers with a Teams meeting link that they can join directly from the web application for example. In a real-world scenario where the back-office users have Azure AD, this differentiation could be easily achieved by setting up [federation from Azure AD B2C towards the back-office organization's Azure AD](https://docs.microsoft.com/azure/active-directory-b2c/identity-provider-azure-ad-single-tenant?pivots=b2c-user-flow). That way, the back-office users would have an `idp` claim in their token representing their organizational Azure AD instance. If the app inspects the `idp` claim and finds that the user signed in from the right organization (i.e. the back-office Azure AD tenant), the user experience could be tailored to reviewing and scheduling meeting requests for example. If that `idp` claim is missing or is from another tenant, the user can be considered an end customer instead.

## Setup

### Configure Azure AD B2C

- Create an **app registration for the sample app**:
  - Make sure to create the app registration for use with **Accounts in any identity provider or organizational directory (for authenticating users with user flows)**.
  - Add a **Single-page application** platform to the app registration and set the Redirect URI to `https://localhost:5001` when running locally or `https://<your-host>` when running publicly.
  - The client id of this application should go into the `AzureAdB2C:ClientId` application setting.
- **Create user flows** for **Sign up and sign in**, or alternatively use an existing user flow for sign-in (and/or sign-up).

### Configure and run the sample app

There are a few options to run the sample app (containing both the REST API and the web application):

- You can build and run it locally.
  - You can open the root folder of this repo in [Visual Studio Code](https://code.visualstudio.com/) where you can just build and debug (install the recommended extensions in the workspace if you don't have them).
  - In this case, application settings are configured in the `Calling/appsettings.json` file or by using [.NET User Secrets](https://docs.microsoft.com/aspnet/core/security/app-secrets).
- You can build and run it in a [devcontainer](https://code.visualstudio.com/docs/remote/containers) (including [GitHub Codespaces](https://github.com/features/codespaces)).
  - All pre-requisites such as .NET and Node.js are provided in the devcontainer so you don't need to install anything locally.
  - In this case, application settings are configured in the `Calling/appsettings.json` file or by using [.NET User Secrets](https://docs.microsoft.com/aspnet/core/security/app-secrets).
- You can host a pre-built Docker container which contains the sample app.
  - You can find the latest published version of the Docker container publicly on **Docker Hub** at **[jelledruyts/identitysamplesb2c-videocalling](https://hub.docker.com/r/jelledruyts/identitysamplesb2c-videocalling)**
  - In this case, application settings are configured through environment variables. Note that on Linux a colon (`:`) is not allowed in an environment variable, so use a double underscore instead of `:` in that case (e.g. `AzureAdB2C__ClientId`).
- You can easily deploy that same container to Azure App Service.
  - [![Deploy to Azure](https://aka.ms/deploytoazurebutton)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Fjelledruyts%2FIdentitySamplesB2C-VideoCalling%2Fmain%2Fazuredeploy.json)
  - In this case, you will be prompted to fill in the right application settings for the web app during deployment.
  - A free App Service Plan will be created for the web app, along with an Azure Communication Services resource.

In all cases, you'll need to configure the following application settings with the right values for your environment (see [Calling/appsettings.json](Calling/appsettings.json)): `AzureAdB2C:Instance`, `AzureAdB2C:ClientId`, `AzureAdB2C:Domain`, `AzureAdB2C:SignUpSignInPolicyId` and `ResourceConnectionString` (for Azure Communication Services). Optionally, to change the path where the local user "database" files are stored, change the `App:FileRepositoryBasePath` setting. The other settings (for feedback and recording) are optional as they are "inherited" from the original [group calling sample](https://github.com/Azure-Samples/communication-services-web-calling-hero/tree/public-preview).

### Try it out

When the sample app is running, you'll be asked to sign in with your Azure AD B2C directory. As mentioned above, the sample application doesn't currently distinguish between end customers and back-office users, so you can sign in with any account. You can then start a new call that others can join, or you can join an existing Teams meeting by entering the meeting URL to simulate the end customer joining a Teams meeting set up by a back-office user. Once you're in the call, you can find the link to allow other users to join at the bottom of the *People* panel.
