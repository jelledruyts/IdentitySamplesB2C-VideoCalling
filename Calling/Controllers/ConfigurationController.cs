// © Microsoft Corporation. All rights reserved.

using System;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace Calling
{
    public class ConfigurationController : Controller
    {
        private readonly IConfiguration configuration;
        public ConfigurationController(IConfiguration configuration)
        {
            this.configuration = configuration;
        }

        [Route("/config")]
        public IActionResult Get()
        {
            var clientResponse = new
            {
                b2cTenantName = this.configuration["AzureAdB2C:Domain"].Replace(".onmicrosoft.com", string.Empty, StringComparison.InvariantCultureIgnoreCase),
                b2cClientId = this.configuration["AzureAdB2C:ClientId"],
                signUpSignInPolicyId = this.configuration["AzureAdB2C:PolicyId"]
            };
            return this.Ok(clientResponse);
        }
    }
}