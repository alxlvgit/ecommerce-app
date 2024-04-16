using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class ShoppingCart
{ 
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)] 
    public int id { get; set; }
    public string user_id { get; set; }
    public DateTimeOffset created_at { get; set; }
}