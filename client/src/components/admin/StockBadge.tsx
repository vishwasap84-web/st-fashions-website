import { Badge } from "@/components/ui/badge";

type Props = {
  color: string;
  qty: number;
};

export function StockBadge({ color, qty }: Props) {
  let variant: "destructive" | "secondary" | "default" = "default";

  if (qty === 0) variant = "destructive";
  else if (qty <= 5) variant = "secondary";

  return (
    <Badge variant={variant} className="mr-2 mb-1">
      {color} ({qty})  
    </Badge>
  );
}
