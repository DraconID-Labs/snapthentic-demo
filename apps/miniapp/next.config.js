/** @type {import("next").NextConfig} */
const config = {
  images: {
    domains: ["res.cloudinary.com", "fhtuskhkfbauvscxgdir.supabase.co"],
    remotePatterns: [
      new URL("https://res.cloudinary.com/"),
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
};

export default config;
