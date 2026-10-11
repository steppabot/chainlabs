// ChainLab site settings. Edit these, commit, and the site updates.
window.CL_CONFIG = {
  brand: "ChainLab Peptides",
  supportEmail: "support@chainlabpeptides.com",

  // Contact + order-request forms are delivered by FormSubmit (free, no backend).
  // The FIRST submission sends a one-time activation email to supportEmail —
  // click the link in it, then every form submission lands in your inbox.
  formEndpoint: "https://formsubmit.co/ajax/support@chainlabpeptides.com",

  // Your Bitcoin receiving address (from your own wallet, e.g. BlueWallet/Exodus/Electrum).
  // Checkout shows a QR code + copy buttons; buyers can pay from Cash App's Bitcoin tab.
  btcAddress: "3Pq9JG7MPGbVvXn9TmRthejFZA25S4DRVD",

  // Back office (orders database). Paste these from Supabase → Project Settings → API.
  // Leave empty to run without the back office (orders then only arrive by email).
  supabaseUrl: "",
  supabaseAnonKey: "",

  // Shipping shown in the cart (USD). Set freeShippingOver to 0 to disable.
  shippingFlat: 15,
  freeShippingOver: 300
};
