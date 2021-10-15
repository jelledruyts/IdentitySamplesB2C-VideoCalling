using System;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;
using Calling.Models;

namespace Calling.Services
{
    // Stores persistent data in files on the local file system; in real production scenarios you would likely use a database for this.
    public class FileStorageRepository : IRepository
    {
        private const string EntityTypeUser = "user";
        private readonly string basePath;

        public FileStorageRepository(string basePath)
        {
            if (string.IsNullOrWhiteSpace(basePath))
            {
                throw new ArgumentNullException(nameof(basePath));
            }

            // Ensure that the directory exists.
            this.basePath = basePath;
            Directory.CreateDirectory(this.basePath);
        }

        public async Task<User> GetUserAsync(string id)
        {
            var user = await GetEntity<User>(EntityTypeUser, id);
            if (user == null)
            {
                user = new User { Id = id };
            }
            return user;
        }

        public Task SaveUserAsync(User user)
        {
            return SaveEntity(EntityTypeUser, user.Id, user);
        }

        private async Task<T> GetEntity<T>(string entityType, string id) where T : class
        {
            var fileName = GetFileName(entityType, id);
            if (!File.Exists(fileName))
            {
                return null;
            }
            var contents = await File.ReadAllTextAsync(fileName);
            return JsonSerializer.Deserialize<T>(contents);
        }

        private async Task SaveEntity<T>(string entityType, string id, T entity) where T : class
        {
            var fileName = GetFileName(entityType, id);
            var contents = JsonSerializer.Serialize(entity);
            await File.WriteAllTextAsync(fileName, contents);
        }

        private string GetFileName(string entityType, string id)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                throw new ArgumentNullException(nameof(id));
            }
            return Path.Combine(this.basePath, $"{entityType}-{id}.json");
        }
    }
}