// ChainLab site settings. Edit these, commit, and the site updates.
window.CL_CONFIG = {
  brand: "ChainLab Peptides",
  supportEmail: "support@chainlabpeptides.com",

  // Contact + order-request forms are delivered by FormSubmit (free, no backend).
  // The FIRST submission sends a one-time activation email to supportEmail —
  // click the link in it, then every form submission lands in your inbox.
  formEndpoint: "https://formsubmit.co/ajax/support@chainlabpeptides.com",

  // Optional: paste a PayPal REST *client ID* here to show PayPal buttons in the cart.
  // Leave empty to use "Request order" (customer submits cart, you invoice them).
  paypalClientId: "",

  // Shipping shown in the cart (USD). Set freeShippingOver to 0 to disable.
  shippingFlat: 15,
  freeShippingOver: 300
};
