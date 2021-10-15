// © Microsoft Corporation. All rights reserved.

using System;
using System.Linq;
using System.Threading.Tasks;
using Azure;
using Azure.Communication;
using Azure.Communication.Identity;
using Azure.Core;
using Calling.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace Calling
{
    public class UserTokenController : Controller
    {
        private const string ObjectIdClaimType = "oid";
        private static readonly CommunicationTokenScope[] AcsTokenScopes = new[] { CommunicationTokenScope.VoIP };
        private readonly CommunicationIdentityClient _client;
        private readonly IRepository _repository;

        public UserTokenController(IConfiguration configuration, IRepository repository)
        {
            _client = new CommunicationIdentityClient(configuration["ResourceConnectionString"]);
            _repository = repository;
        }

        /// <summary>
        /// Gets a token to be used to initalize the call client
        /// </summary>
        /// <returns></returns>
        [Route("/token")]
        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAsync()
        {
            try
            {
                // The user has authenticated with an OAuth 2.0 access token issued by Azure AD B2C.
                // Get the "oid" claim which holds the user's unique object identifier in the directory.
                var objectId = this.User.Claims.FirstOrDefault(c => c.Type == ObjectIdClaimType)?.Value;
                if (objectId == null)
                {
                    return this.BadRequest($"User's \"{ObjectIdClaimType}\" claim not found.");
                }

                // Get the user details from the database.
                var user = await _repository.GetUserAsync(objectId);
                var acsAccessToken = default(AccessToken);

                // Get an access token for Azure Communication Services if the user has a corresponding
                // communication user id there.
                if (user.AcsUserId == null)
                {
                    // Create the corresponding user in the Azure Communication Services user store
                    // along with an access token in one request.
                    var response = await _client.CreateUserAndTokenAsync(scopes: AcsTokenScopes);
                    user.AcsUserId = response.Value.User.Id;
                    await _repository.SaveUserAsync(user);
                    acsAccessToken = response.Value.AccessToken;
                }
                else
                {
                    // The user already exists, request a new access token for Azure Communication Services.
                    var identifier = new CommunicationUserIdentifier(user.AcsUserId);
                    var response = await _client.GetTokenAsync(identifier, scopes: AcsTokenScopes);
                    acsAccessToken = response.Value;
                }

                // Return the access token along with some relevant other information.
                var clientResponse = new
                {
                    user = new
                    {
                        communicationUserId = user.AcsUserId
                    },
                    token = acsAccessToken.Token,
                    expiresOn = acsAccessToken.ExpiresOn
                };

                return this.Ok(clientResponse);
            }
            catch (RequestFailedException ex)
            {
                Console.WriteLine($"Error occured while Generating Token: {ex}");
                return this.Ok(this.Json(ex));
            }
        }
    }
}
