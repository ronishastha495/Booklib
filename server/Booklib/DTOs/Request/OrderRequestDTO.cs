public class OrderRequestDTO
{
    public List<OrderItemRequestDTO> Items { get; set; } = new();
}

public class OrderItemRequestDTO
{
    public Guid BookId { get; set; }
    public int Quantity { get; set; }
}