export const contactMainContactToggleBlockItems = [
  {
    anim: "Contact.Toggle0",
    for: "Name",
    text: "Your Name",
    name: "name",
    placeholder: "Enter your full name",
    type: "text",
    id: "Name",
  },
  {
    anim: "Contact.Toggle1",
    for: "Email",
    text: "Email Address",
    name: "Email",
    placeholder: "name@company.com",
    type: "email",
    id: "Email",
  },
] as const;

export const contactInfoContactMediaCardItems = [
  {
    text: "email",
    href: "mailto:support@continer.com?subject=Mail",
    text2: "support@continer.com",
    target: undefined,
  },
  {
    text: "Address",
    href: "https://maps.app.goo.gl/9yBPmgxLZxb7hU4x8",
    text2: "Logistics Tower, Port District, TX",
    target: "_blank",
  },
] as const;
