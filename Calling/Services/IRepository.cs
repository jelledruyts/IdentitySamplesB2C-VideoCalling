using System.Threading.Tasks;
using Calling.Models;

namespace Calling.Services
{
    public interface IRepository
    {
        Task<User> GetUserAsync(string id);
        Task SaveUserAsync(User user);
    }
}