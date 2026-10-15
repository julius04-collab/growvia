export type NavItem = { href: string; label: string; short: string; exact?: boolean };

export const userNav = (base = "/dashboard", account = true): NavItem[] => [
  { href: base, label: "Dashboard", short: "Home", exact: true },
  { href: `${base}/new-order`, label: "New order", short: "Order" },
  { href: `${base}/orders`, label: "Orders", short: "Orders" },
  { href: `${base}/add-funds`, label: "Add funds", short: "Funds" },
  { href: `${base}/support`, label: "Support", short: "Help" },
  ...(account ? [{ href: `${base}/account`, label: "Account", short: "Me" }] : []),
];

export const adminNav: NavItem[] = [
  { href: "/admin", label: "Overview", short: "Home", exact: true },
  { href: "/admin/orders", label: "Orders", short: "Orders" },
  { href: "/admin/users", label: "Users", short: "Users" },
  { href: "/admin/services", label: "Services", short: "Prices" },
  { href: "/admin/payments", label: "Payments", short: "Pay" },
  { href: "/admin/tickets", label: "Tickets", short: "Help" },
];
