namespace CloneRozetka.Domain.Entities
{
    public class User
    {
        public int Id { get; set; }                    
        public string? FullName { get; set; }
        public string? AvatarUrl { get; set; }
        public string? Email { get; set; }
        public string? GoogleId { get; set; }

        public bool IsEmailVarified { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLoginAt { get; set; }
        public bool IsBlocked { get; set; }
    }
}
