export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQS: FaqItem[] = [
  {
    question: "What is a transparent PNG?",
    answer:
      "A transparent PNG (Portable Network Graphics) is an image format that includes an alpha transparency channel. Unlike standard JPG files—which always force an opaque white or colored background box—a transparent PNG allows your website background, color gradients, or photography to show through seamlessly around your logo symbol and typography. This eliminates the unsightly 'white sticker' box when placing your logo on dark headers, hero banners, or colored merchandise.",
  },
  {
    question: "What size should my logo be for a website?",
    answer:
      "For modern high-density screens (Apple Retina and modern mobile displays), your website header logo should be exported at 2x resolution to stay razor-sharp. A master resolution of 512 × 512 px (or 256 × 256 px for compact layouts) provides ample pixel density when rendered at 150px to 250px on screen. Logo File Kit automatically generates both 512 × 512 px and 256 × 256 px files, ensuring your brand marks look crisp on 4K monitors and mobile phones alike.",
  },
  {
    question: "How do I make a favicon from my logo?",
    answer:
      "A favicon is the tiny brand icon displayed in browser tabs, bookmarks, and mobile home screen shortcuts. To make one, choose your primary logo mark (or simplified brand icon) with 10% padding so it remains legible at micro scales. Logo File Kit exports the full suite of modern favicon dimensions: 64 × 64 px (Retina tabs), 48 × 48 px (desktop shortcuts), 32 × 32 px (standard tabs), and 16 × 16 px (classic address bars). You can link these directly in your HTML <head> or use the 32 × 32 PNG as your favicon.ico.",
  },
  {
    question: "Is Logo File Kit free?",
    answer:
      "Yes, Logo File Kit is 100% free with no hidden fees, no credit cards, no subscriptions, no account registration, and zero watermarks. It was built by Abid Mahmud, a professional brand identity designer, to empower founders, web designers, and marketing teams to export production-ready logo assets without needing expensive graphic design software like Adobe Photoshop or Illustrator.",
  },
  {
    question: "Is my logo uploaded anywhere?",
    answer:
      "No. Your logo is never uploaded to any remote server, cloud bucket, or external database. All vector rasterization, color modifications, padding calculations, and file exports are executed 100% locally inside your web browser using the HTML5 Canvas API and WebAssembly. Your proprietary brand assets, unpublished client marks, and confidential intellectual property never leave your machine.",
  },
];
