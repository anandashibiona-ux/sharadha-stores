const STATUS_MAP = {
  in_stock:    { label: 'In Stock',    cls: 'badge-success' },
  low_stock:   { label: 'Low Stock',   cls: 'badge-warning' },
  out_of_stock:{ label: 'Out of Stock',cls: 'badge-error'   },
  PENDING:     { label: 'Pending',     cls: 'badge-muted'   },
  CONFIRMED:   { label: 'Confirmed',   cls: 'badge-accent'  },
  DISPATCHED:  { label: 'Dispatched',  cls: 'badge-warning' },
  DELIVERED:   { label: 'Delivered',   cls: 'badge-success' },
  CANCELLED:   { label: 'Cancelled',   cls: 'badge-error'   },
}

export default function StatusBadge({ status }) {
  const config = STATUS_MAP[status] || { label: status, cls: 'badge-muted' }
  return <span className={config.cls}>{config.label}</span>
}
