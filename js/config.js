// ChainLab site settings. Edit these, commit, and the site updates.
window.CL_CONFIG = {
  brand: "ChainLab Peptides",
  supportEmail: "support@chainlabpeptides.com",

  // Your Bitcoin receiving address (from your own wallet, e.g. BlueWallet/Exodus/Electrum).
  // Checkout shows a QR code + copy buttons; buyers can pay from Cash App's Bitcoin tab.
  btcAddress: "3Pq9JG7MPGbVvXn9TmRthejFZA25S4DRVD",

  // Orders + contact messages are stored in Supabase and managed at /admin.html.
  // Paste these from Supabase → Project Settings → API (Project URL + anon/publishable key).
  supabaseUrl: "https://ppfsoeakpoxymqibcnfh.supabase.co",
  supabaseAnonKey: "sb_publishable_ObTDajjE4HCB6FOg3BcnAw_i4vml7W0",

  // Shipping shown in the cart (USD). Set freeShippingOver to 0 to disable.
  shippingFlat: 15,
  freeShippingOver: 300
};
