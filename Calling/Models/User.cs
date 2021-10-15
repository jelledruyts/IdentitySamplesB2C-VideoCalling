namespace Calling.Models
{
    public class User
    {
        public string Id { get; set; } // The object id of the user in Azure AD B2C.
        public string AcsUserId { get; set; } // The communication user id in Azure Communication Services.
    }
}