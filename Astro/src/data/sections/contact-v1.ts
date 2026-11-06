export const contactMainContactInfoBlockItems = [
  {
    anim: "Contact.Card01",
    text: "Global HQ",
    href: "https://maps.app.goo.gl/CAYw319Y4GVy7Ji57",
    target: "_blank",
    text2: "Continer Logistics Tower, Port District, TX",
  },
  {
    anim: "Contact.Card02",
    text: "Direct Desk",
    href: "mailto:operations@continer.com?subject=Mail",
    target: undefined,
    text2: "operations@continer.com",
  },
] as const;

export const contactMainContactToggleBlockItems = [
  {
    anim: "Contact.Toggle0",
    for: "name",
    text: "Your Name",
    name: "name",
    placeholder: "Enter your full name",
    type: "text",
    id: "name",
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
