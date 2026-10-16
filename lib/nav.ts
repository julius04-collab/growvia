export type NavItem = {
  href: string;
  label: string;
  short: string;
  icon: string;
  exact?: boolean;
  mobile?: boolean; // false = hidden from the bottom dock
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
  { href: "/admin/users", label: "Users", short: "Users", icon: "users" },
  { href: "/admin/services", label: "Services", short: "Prices", icon: "tag" },
  { href: "/admin/payments", label: "Payments", short: "Pay", icon: "card" },
  { href: "/admin/tickets", label: "Tickets", short: "Help", icon: "chat" },
];
