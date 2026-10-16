export type NavItem = {
  href: string;
  label: string;
  short: string;
  icon: string;
  exact?: boolean;
  mobile?: boolean; // false = hidden from the bottom dock
  desktop?: boolean; // false = hidden from the desktop sidebar
  primary?: boolean; // the raised centre button
};

export const userNav = (base = "/dashboard", account = true): NavItem[] => [
  { href: base, label: "Dashboard", short: "Home", icon: "home", exact: true },
  { href: `${base}/new-order`, label: "New order", short: "New", icon: "plus", primary: true },
  { href: `${base}/orders`, label: "Orders", short: "Orders", icon: "list" },
  { href: `${base}/add-funds`, label: "Add funds", short: "Funds", icon: "wallet" },
  { href: `${base}/support`, label: "Support", short: "Help", icon: "chat" },
  ...(account ? [{ href: `${base}/account`, label: "Account", short: "Me", icon: "user", mobile: false }] : []),
];

export const adminNav: NavItem[] = [
  { href: "/admin", label: "Overview", short: "Home", icon: "home", exact: true },
  { href: "/admin/orders", label: "Orders", short: "Orders", icon: "list" },
  { href: "/admin/users", label: "Customers", short: "Users", icon: "users", mobile: false },
  { href: "/admin/services", label: "Services and prices", short: "Prices", icon: "tag" },
  { href: "/admin/payments", label: "Payments", short: "Pay", icon: "card" },
  { href: "/admin/refunds", label: "Refunds", short: "Refunds", icon: "undo", mobile: false },
  { href: "/admin/supplier", label: "Supplier", short: "Supplier", icon: "server", mobile: false },
  { href: "/admin/tickets", label: "Tickets", short: "Help", icon: "chat", mobile: false },
  { href: "/admin/settings", label: "Settings", short: "Settings", icon: "gear", mobile: false },
  { href: "/admin/more", label: "More", short: "More", icon: "grid", desktop: false },
];
